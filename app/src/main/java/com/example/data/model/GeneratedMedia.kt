package com.example.data.model

data class GeneratedMedia(
    val id: String,
    val prompt: String,
    val style: String? = null,
    val size: String = "1024x1024",
    val imageBase64: String,
    val createdAt: Long = System.currentTimeMillis()
)

data class MediaStats(
    val total: Int = 0,
    val today: Int = 0,
    val topDimension: String = "1024x1024",
    val bySize: Map<String, Int> = emptyMap()
)
