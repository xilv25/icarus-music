package com.icarus.music

import android.content.Intent
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        webView = WebView(this)
        setContentView(webView)

        // Konfigurasi WebView agar mendukung JavaScript dan pemutaran audio lancar
        val webSettings: WebSettings = webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.mediaPlaybackRequiresUserGesture = false

        webView.webViewClient = WebViewClient()
        
        // Memuat domain live kamu
        webView.loadUrl("https://icarusmusic.web.id")

        // Memulai Foreground Service agar audio aman saat HP dikunci
        val serviceIntent = Intent(this, MusicService::class.java)
        startForegroundService(serviceIntent)
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
