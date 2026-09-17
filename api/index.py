from flask import Flask, request, jsonify
from ytmusicapi import YTMusic
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Menggunakan inisialisasi publik agar tidak error saat deploy dari HP
yt = YTMusic()

@app.route('/api/search', methods=['GET'])
def search_music():
    query = request.args.get('q', 'Oasis Wonderwall')
    try:
        # Mencari spesifik lagu (bisa diganti filter="videos" atau "albums")
        results = yt.search(query, filter="songs")
        return jsonify({"status": "success", "data": results})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
      
