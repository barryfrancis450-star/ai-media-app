package com.example.ui.viewmodel

import android.content.ContentValues
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.data.model.GeneratedMedia
import com.example.data.model.MediaStats
import com.example.data.remote.ImageSynthesizer
import com.example.data.repository.MediaRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.OutputStream

class MediaViewModel(
    private val repository: MediaRepository
) : ViewModel() {

    // Image Generator Form State
    private val _prompt = MutableStateFlow("")
    val prompt: StateFlow<String> = _prompt.asStateFlow()

    private val _selectedSize = MutableStateFlow("1024x1024")
    val selectedSize: StateFlow<String> = _selectedSize.asStateFlow()

    private val _styleHint = MutableStateFlow("")
    val styleHint: StateFlow<String> = _styleHint.asStateFlow()

    private val _isGenerating = MutableStateFlow(false)
    val isGenerating: StateFlow<Boolean> = _isGenerating.asStateFlow()

    private val _latestGeneratedImage = MutableStateFlow<GeneratedMedia?>(null)
    val latestGeneratedImage: StateFlow<GeneratedMedia?> = _latestGeneratedImage.asStateFlow()

    private val _userMessage = MutableStateFlow<String?>(null)
    val userMessage: StateFlow<String?> = _userMessage.asStateFlow()

    // Gallery state
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedDetailMedia = MutableStateFlow<GeneratedMedia?>(null)
    val selectedDetailMedia: StateFlow<GeneratedMedia?> = _selectedDetailMedia.asStateFlow()

    val allMedia: StateFlow<List<GeneratedMedia>> = repository.getMediaListFlow()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val filteredMedia: StateFlow<List<GeneratedMedia>> = combine(allMedia, _searchQuery) { list, query ->
        if (query.isBlank()) {
            list
        } else {
            list.filter { it.prompt.contains(query, ignoreCase = true) || (it.style?.contains(query, ignoreCase = true) == true) }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val stats: StateFlow<MediaStats> = repository.getStatsFlow()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), MediaStats())

    fun updatePrompt(text: String) {
        _prompt.value = text
    }

    fun updateSize(size: String) {
        _selectedSize.value = size
    }

    fun updateStyleHint(style: String) {
        _styleHint.value = style
    }

    fun selectInspirationStyle(style: String) {
        _styleHint.value = style
    }

    fun clearUserMessage() {
        _userMessage.value = null
    }

    fun selectDetailMedia(media: GeneratedMedia?) {
        _selectedDetailMedia.value = media
    }

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun generateImage(onSuccess: (GeneratedMedia) -> Unit = {}) {
        val currentPrompt = _prompt.value.trim()
        if (currentPrompt.length < 3) {
            _userMessage.value = "Prompt must be at least 3 characters"
            return
        }

        viewModelScope.launch {
            _isGenerating.value = true
            _userMessage.value = null
            try {
                val media = ImageSynthesizer.generateImage(
                    prompt = currentPrompt,
                    style = _styleHint.value.trim().takeIf { it.isNotEmpty() },
                    size = _selectedSize.value
                )
                repository.saveMedia(media)
                _latestGeneratedImage.value = media
                _userMessage.value = "Image generated and saved to your gallery."
                onSuccess(media)
            } catch (e: Exception) {
                _userMessage.value = "Generation failed: ${e.localizedMessage ?: "Unknown error"}"
            } finally {
                _isGenerating.value = false
            }
        }
    }

    fun deleteMedia(id: String) {
        viewModelScope.launch {
            val success = repository.deleteMedia(id)
            if (success) {
                if (_latestGeneratedImage.value?.id == id) {
                    _latestGeneratedImage.value = null
                }
                if (_selectedDetailMedia.value?.id == id) {
                    _selectedDetailMedia.value = null
                }
                _userMessage.value = "Image removed from gallery."
            }
        }
    }

    fun saveImageToDevice(context: Context, media: GeneratedMedia, onComplete: (Boolean) -> Unit) {
        viewModelScope.launch(Dispatchers.IO) {
            var success = false
            try {
                val imageBytes = Base64.decode(media.imageBase64, Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)

                val filename = "AIMedia_${System.currentTimeMillis()}.jpg"
                val contentValues = ContentValues().apply {
                    put(MediaStore.MediaColumns.DISPLAY_NAME, filename)
                    put(MediaStore.MediaColumns.MIME_TYPE, "image/jpeg")
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/AIMedia")
                        put(MediaStore.MediaColumns.IS_PENDING, 1)
                    }
                }

                val resolver = context.contentResolver
                val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)

                if (uri != null) {
                    val outStream: OutputStream? = resolver.openOutputStream(uri)
                    if (outStream != null) {
                        bitmap.compress(Bitmap.CompressFormat.JPEG, 95, outStream)
                        outStream.flush()
                        outStream.close()
                    }

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        contentValues.clear()
                        contentValues.put(MediaStore.MediaColumns.IS_PENDING, 0)
                        resolver.update(uri, contentValues, null, null)
                    }
                    success = true
                }
            } catch (e: Exception) {
                success = false
            }

            withContext(Dispatchers.Main) {
                _userMessage.value = if (success) "Saved to device Photos / Gallery." else "Failed to save image."
                onComplete(success)
            }
        }
    }

    companion object {
        fun provideFactory(repository: MediaRepository): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return MediaViewModel(repository) as T
                }
            }
    }
}
