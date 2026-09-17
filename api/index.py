from flask import Flask, request, jsonify
from ytmusicapi import YTMusic
from flask_cors import CORS
import yt_dlp

app = Flask(__name__)
CORS(app)

yt = YTMusic()

@app.route('/api/search', methods=['GET'])
def search_music():
    query = request.args.get('q', 'Oasis Wonderwall')
    try:
        results = yt.search(query, filter="songs")
        return jsonify({"status": "success", "data": results})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Endpoint baru untuk mengambil URL audio
@app.route('/api/stream', methods=['GET'])
def stream_music():
    video_id = request.args.get('id')
    if not video_id:
        return jsonify({"status": "error", "message": "ID tidak ditemukan"}), 400

    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'quiet': True,
            'no_warnings': True,
            'skip_download': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            return jsonify({"status": "success", "url": info['url']})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
        
