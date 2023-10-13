from flask import Flask, request, jsonify
from flask import send_from_directory


app = Flask(__name__)

# 初始化待辦事項清單和ID計數器
todos = []
id_counter = 1

# 啟動網頁


@app.route('/')
def index():
    return open('index.html').read()

# 添加其他靜態檔案的路由


@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)


# 路由和函數來添加新的待辦事項


@app.route('/add_todo', methods=['POST'])
def add_todo():
    global id_counter
    text = request.form.get('text')  # 從請求中獲取待辦事項的內容
    todos.append({
        'id': id_counter,  # 分配一個唯一的ID
        'text': text,
        'completed': False  # 初始狀態為未完成
    })
    id_counter += 1
    return jsonify(success=True)

# 路由和函數來刪除指定的待辦事項


@app.route('/delete_todo', methods=['POST'])
def delete_todo():
    id = int(request.form.get('id'))  # 從請求中獲取待辦事項的ID
    global todos
    # 從清單中刪除指定的待辦事項
    todos = [todo for todo in todos if todo['id'] != id]
    return jsonify(success=True)

# 路由和函數來標記指定的待辦事項為已完成


@app.route('/complete_todo', methods=['POST'])
def complete_todo():
    id = int(request.form.get('id'))  # 從請求中獲取待辦事項的ID
    for todo in todos:
        if todo['id'] == id:
            todo['completed'] = True  # 標記為已完成
            break
    return jsonify(success=True)

# 路由和函數來獲取所有待辦事項


@app.route('/get_todos', methods=['GET'])
def get_todos():
    return jsonify(todos)


# 啟動Flask伺服器
if __name__ == '__main__':
    app.run(debug=True)
