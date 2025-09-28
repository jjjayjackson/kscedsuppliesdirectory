from flask import Flask, jsonify, render_template, request, redirect, url_for
import sqlite3
import mimetypes
import os

# Fix MIME types for Windows
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('application/javascript', '.js')

app = Flask(__name__)

# Define valid room tables
ROOMS = ["big_blue", "central", "little_blue", "ob_gyne", "rc_94_95", "rc_lac"]

# Debug prints
print(f"Flask static folder: {app.static_folder}")
print(f"Flask template folder: {app.template_folder}")

@app.route('/')
def serve_html():
    return render_template('index.html', rooms=ROOMS)

@app.route('/search')
def search_supplies():
    query = request.args.get('q', '').lower().strip()
    room = request.args.get('room', '').lower().strip()

    if not query or not room or room not in ROOMS:
        return jsonify({'error': 'Missing query or invalid room'}), 400
    
    # Split query into words, filter out empties
    words = [word for word in query.split() if word]
    
    if not words:
        return jsonify([])
    
    try:
        conn = sqlite3.connect('supplies_directory.db')
        cursor = conn.cursor()
        
        # Build dynamic WHERE clause and parameters for multi-word search
        conditions = []
        params = []
        for word in words:
            word_conditions = [
                "LOWER(name) LIKE ?",
                "LOWER(name) LIKE ?",
                "LOWER(name) LIKE ?",
                "LOWER(name) = ?"
            ]
            conditions.append(f"({' OR '.join(word_conditions)})")
            params.extend([
                '% ' + word + ' %',  # Middle
                word + ' %',         # Start
                '% ' + word,         # End
                word                 # Exact
            ])
        
        where_clause = " AND ".join(conditions)
        sql = f"SELECT name, shelf, level FROM {room} WHERE {where_clause}"
        
        cursor.execute(sql, params)
        supplies = cursor.fetchall()
        conn.close()
        print(f"Search for '{query}' in '{room}' returned {len(supplies)} results")
        return jsonify(supplies)
    except sqlite3.Error as e:
        print(f"DB Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/history.html')
def history():
    return render_template('history.html')

@app.route('/upgrades.html')
def upgrades():
    return render_template('upgrades.html')

if __name__ == '__main__':
    app.run(debug=True)