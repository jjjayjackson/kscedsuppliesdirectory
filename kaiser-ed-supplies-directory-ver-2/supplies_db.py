import sqlite3

def insert_item(room, item_name, shelf, level):
    conn = sqlite3.connect('supplies_directory.db')
    cursor = conn.cursor()
    try:
        cursor.execute(f"INSERT INTO {room} (name, shelf, level) VALUES (?, ?, ?)", 
                       (item_name, shelf, level))
        conn.commit()
        print(f"Inserted '{item_name}' into '{room}' at shelf {shelf}, level {level}")
        
        # Verify the insertion
        cursor.execute(f"SELECT * FROM {room} WHERE name = ? AND shelf = ? AND level = ?", 
                       (item_name, shelf, level))
        result = cursor.fetchone()
        if result:
            print(f"Verification: Found '{item_name}' in '{room}' at shelf {shelf}, level {level}")
        else:
            print(f"Verification: '{item_name}' not found in '{room}'")
    except sqlite3.Error as e:
        print(f"Error inserting into '{room}': {e}")
    finally:
        conn.close()

# Insert the specific item
insert_item("little_blue", "", "L", 1)

