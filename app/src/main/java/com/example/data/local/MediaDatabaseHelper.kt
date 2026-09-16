package com.example.data.local

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import com.example.data.model.GeneratedMedia
import com.example.data.model.MediaStats
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.withContext
import java.util.Calendar

class MediaDatabaseHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        private const val DATABASE_NAME = "ai_media.db"
        private const val DATABASE_VERSION = 1

        private const val TABLE_MEDIA = "generated_media"
        private const val COL_ID = "id"
        private const val COL_PROMPT = "prompt"
        private const val COL_STYLE = "style"
        private const val COL_SIZE = "size"
        private const val COL_IMAGE_BASE64 = "image_base64"
        private const val COL_CREATED_AT = "created_at"
    }

    private val _updates = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val updates = _updates.asSharedFlow()

    override fun onCreate(db: SQLiteDatabase) {
        val createQuery = """
            CREATE TABLE $TABLE_MEDIA (
                $COL_ID TEXT PRIMARY KEY,
                $COL_PROMPT TEXT NOT NULL,
                $COL_STYLE TEXT,
                $COL_SIZE TEXT NOT NULL,
                $COL_IMAGE_BASE64 TEXT NOT NULL,
                $COL_CREATED_AT INTEGER NOT NULL
            )
        """.trimIndent()
        db.execSQL(createQuery)
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS $TABLE_MEDIA")
        onCreate(db)
    }

    suspend fun insertMedia(media: GeneratedMedia): Boolean = withContext(Dispatchers.IO) {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(COL_ID, media.id)
            put(COL_PROMPT, media.prompt)
            put(COL_STYLE, media.style)
            put(COL_SIZE, media.size)
            put(COL_IMAGE_BASE64, media.imageBase64)
            put(COL_CREATED_AT, media.createdAt)
        }
        val result = db.insertWithOnConflict(TABLE_MEDIA, null, values, SQLiteDatabase.CONFLICT_REPLACE)
        if (result != -1L) {
            _updates.tryEmit(Unit)
            true
        } else {
            false
        }
    }

    suspend fun deleteMedia(id: String): Boolean = withContext(Dispatchers.IO) {
        val db = writableDatabase
        val rows = db.delete(TABLE_MEDIA, "$COL_ID = ?", arrayOf(id))
        if (rows > 0) {
            _updates.tryEmit(Unit)
            true
        } else {
            false
        }
    }

    suspend fun getAllMedia(): List<GeneratedMedia> = withContext(Dispatchers.IO) {
        val list = mutableListOf<GeneratedMedia>()
        val db = readableDatabase
        val cursor = db.query(
            TABLE_MEDIA,
            null,
            null,
            null,
            null,
            null,
            "$COL_CREATED_AT DESC"
        )
        cursor.use {
            val idIdx = it.getColumnIndexOrThrow(COL_ID)
            val promptIdx = it.getColumnIndexOrThrow(COL_PROMPT)
            val styleIdx = it.getColumnIndexOrThrow(COL_STYLE)
            val sizeIdx = it.getColumnIndexOrThrow(COL_SIZE)
            val imgIdx = it.getColumnIndexOrThrow(COL_IMAGE_BASE64)
            val createdIdx = it.getColumnIndexOrThrow(COL_CREATED_AT)

            while (it.moveToNext()) {
                list.add(
                    GeneratedMedia(
                        id = it.getString(idIdx),
                        prompt = it.getString(promptIdx),
                        style = it.getString(styleIdx),
                        size = it.getString(sizeIdx),
                        imageBase64 = it.getString(imgIdx),
                        createdAt = it.getLong(createdIdx)
                    )
                )
            }
        }
        list
    }

    suspend fun getStats(): MediaStats = withContext(Dispatchers.IO) {
        val db = readableDatabase
        var total = 0
        var today = 0
        val bySize = mutableMapOf<String, Int>()

        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val startOfToday = calendar.timeInMillis

        val cursor = db.rawQuery(
            "SELECT $COL_SIZE, $COL_CREATED_AT FROM $TABLE_MEDIA",
            null
        )
        cursor.use {
            val sizeIdx = it.getColumnIndexOrThrow(COL_SIZE)
            val createdIdx = it.getColumnIndexOrThrow(COL_CREATED_AT)

            while (it.moveToNext()) {
                total++
                val size = it.getString(sizeIdx)
                val created = it.getLong(createdIdx)

                bySize[size] = (bySize[size] ?: 0) + 1
                if (created >= startOfToday) {
                    today++
                }
            }
        }

        val topDimension = bySize.maxByOrNull { it.value }?.key ?: "1024x1024"
        MediaStats(
            total = total,
            today = today,
            topDimension = topDimension,
            bySize = bySize
        )
    }
}
