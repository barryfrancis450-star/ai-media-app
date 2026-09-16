package com.example.data.repository

import com.example.data.local.MediaDatabaseHelper
import com.example.data.model.GeneratedMedia
import com.example.data.model.MediaStats
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.withContext

class MediaRepository(private val dbHelper: MediaDatabaseHelper) {

    fun getMediaListFlow(): Flow<List<GeneratedMedia>> = flow {
        emit(dbHelper.getAllMedia())
        dbHelper.updates.collect {
            emit(dbHelper.getAllMedia())
        }
    }.flowOn(Dispatchers.IO)

    fun getStatsFlow(): Flow<MediaStats> = flow {
        emit(dbHelper.getStats())
        dbHelper.updates.collect {
            emit(dbHelper.getStats())
        }
    }.flowOn(Dispatchers.IO)

    suspend fun saveMedia(media: GeneratedMedia): Boolean = withContext(Dispatchers.IO) {
        dbHelper.insertMedia(media)
    }

    suspend fun deleteMedia(id: String): Boolean = withContext(Dispatchers.IO) {
        dbHelper.deleteMedia(id)
    }

    suspend fun getStats(): MediaStats = withContext(Dispatchers.IO) {
        dbHelper.getStats()
    }
}
