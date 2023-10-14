import datetime
from flask import Flask, request, jsonify, redirect, url_for
from flask import send_from_directory
import requests

app = Flask(__name__)

# Notion configurations
NOTION_API_KEY = "secret_qWipKJbYLrOfeFo2XPRYzuz6yX2jNp431R8nCpzlAtB"
NOTION_DATABASE_URL = "https://api.notion.com/v1/databases/b699c73e35614a4cbffa96da27769f3a/query"
NOTION_DATABASE_ID = "b699c73e35614a4cbffa96da27769f3a"
HEADERS = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": "2021-08-16"
}
# 啟動網頁


@app.route('/')
def index():
    return open('index.html').read()

# 添加其他靜態檔案的路由


@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)


# 路由和函數來添加新的待辦事項

@app.route('/get_todos', methods=['GET'])
def get_todos():
    response = requests.post(NOTION_DATABASE_URL, headers=HEADERS)
    results = response.json().get('results')
    todos = [{
        'id': item['id'],
        'text': item['properties']['Text']['rich_text'][0]['plain_text'] if item['properties']['Text']['rich_text'] else "",
        'completed': item['properties']['Completed']['checkbox'],
        'date': item['properties']['Date']['date']['start'] if item['properties']['Date']['date'] else None,
        'urgency': item['properties']['Urgency']['select']['name'] if item['properties']['Urgency']['select'] else None
    } for item in results]
    return jsonify(todos)


@app.route('/add_todo', methods=['POST'])
def add_todo():
    # Extracting data from the form
    text = request.form.get('text')
    date = datetime.datetime.strptime(
        request.form.get('date'), "%b %d, %Y").date().isoformat()
    urgency = request.form.get('urgency')

    # Constructing the payload for the Notion API
    data = {
        "parent": {"database_id": NOTION_DATABASE_ID},
        "properties": {
            "Text": {
                "type": "rich_text",
                "rich_text": [{"type": "text", "text": {"content": text}}]
            },
            "Date": {
                "type": "date",
                "date": {"start": date, "end": None}
            },
            "Urgency": {
                "type": "select",
                "select": {"name": urgency}
            },
            "Completed": {
                "type": "checkbox",
                "checkbox": False
            }
        }
    }

    response = requests.post(
        "https://api.notion.com/v1/pages",
        headers=HEADERS,
        json=data
    )

    # Check if the request was successful
    if response.status_code == 200:
        # Extract the ID of the newly created page from the response
        new_page_id = response.json().get('id')

        # Update the ID field of the newly created page with its page ID
        update_data = {
            "properties": {
                "ID": {
                    "type": "title",
                    "title": [{"type": "text", "text": {"content": new_page_id}}]
                }
            }
        }
        update_response = requests.patch(
            f"https://api.notion.com/v1/pages/{new_page_id}",
            headers=HEADERS,
            json=update_data
        )

        return redirect(url_for('index'))
    else:
        # In a real-world application, better error handling and logging should be implemented.
        return "Error adding todo.", 500


@app.route('/delete_todo', methods=['POST'])
def delete_todo():
    todo_id = request.form.get('id')
    archive_url = f"https://api.notion.com/v1/pages/{todo_id}"
    response = requests.patch(
        archive_url, headers=HEADERS, json={"archived": True})
    return jsonify(success=True)


@app.route('/edit_todo', methods=['POST'])
def edit_todo():
    todo_id = request.form.get('id')
    text = request.form.get('text')
    date = datetime.datetime.strptime(
        request.form.get('date'), "%b %d, %Y").date().isoformat()
    urgency = request.form.get('urgency')
    print(todo_id, text, date, urgency)
    # Constructing the payload for the Notion API
    data = {
        "properties": {
            "Text": {
                "type": "rich_text",
                "rich_text": [{"type": "text", "text": {"content": text}}]
            },
            "Date": {
                "type": "date",
                "date": {"start": date}
            },
            "Urgency": {
                "type": "select",
                "select": {"name": urgency}
            }
        }
    }

    update_url = f"https://api.notion.com/v1/pages/{todo_id}"
    response = requests.patch(update_url, headers=HEADERS, json=data)
    print(response.json())
    # Check if the request was successful
    if response.status_code == 200:
        return jsonify(success=True)
    else:
        # In a real-world application, better error handling and logging should be implemented.
        return jsonify(success=False, message="Error updating todo."), 500


@app.route('/complete_todo', methods=['POST'])
def complete_todo():
    todo_id = request.form.get('id')
    update_url = f"https://api.notion.com/v1/pages/{todo_id}"
    response = requests.patch(update_url, headers=HEADERS, json={
                              "properties": {"Completed": {"checkbox": True}}})
    return jsonify(success=True)


if __name__ == "__main__":
    app.run(debug=True)
