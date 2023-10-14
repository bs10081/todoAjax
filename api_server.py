
from flask import Flask, jsonify, request
from notion_crud import NotionCRUD

app = Flask(__name__)
notion = NotionCRUD(
    "secret_qWipKJbYLrOfeFo2XPRYzuz6yX2jNp431R8nCpzlAtB", "https://api.notion.com/v1/databases/b699c73e35614a4cbffa96da27769f3a/query")


@app.route('/todos', methods=['GET'])
def get_todos():
    return jsonify(notion.get_todos())


@app.route('/todos', methods=['POST'])
def create_todo():
    data = request.get_json()
    text = data.get('text')
    completed = data.get('completed', False)
    date = data.get('date')
    urgency = data.get('urgency')
    return jsonify(notion.create_todo(text, completed, date, urgency))


@app.route('/todos/<todo_id>', methods=['PATCH'])
def update_todo(todo_id):
    data = request.get_json()
    text = data.get('text')
    completed = data.get('completed')
    date = data.get('date')
    urgency = data.get('urgency')
    return jsonify(notion.update_todo(todo_id, text, completed, date, urgency))


@app.route('/todos/<todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    return jsonify(notion.delete_todo(todo_id))


if __name__ == '__main__':
    app.run(debug=True)
