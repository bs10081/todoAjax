// 新增待辦事項的函數
function addTodo() {
    let todoText = $('#todoInput').val();  // 獲取輸入框的值
    // 發送AJAX POST請求到後端，添加新的待辦事項
    $.post('/add_todo', { text: todoText }, function (data) {
        $('#todoInput').val('');  // 清空輸入框的值
        fetchTodos();  // 重新獲取待辦事項清單
    });
}

// 刪除待辦事項的函數
function deleteTodo(id) {
    // 發送AJAX POST請求到後端，刪除指定的待辦事項
    $.post('/delete_todo', { id: id }, function (data) {
        fetchTodos();  // 重新獲取待辦事項清單
    });
}

// 將待辦事項設為已完成的函數
function completeTodo(id) {
    // 發送AJAX POST請求到後端，標記指定的待辦事項為已完成
    $.post('/complete_todo', { id: id }, function (data) {
        fetchTodos();  // 重新獲取待辦事項清單
    });
}

// 獲取待辦事項清單的函數
function fetchTodos() {
    $.get('/get_todos', function (data) {
        let incompleteHtml = '';
        let completeHtml = '';

        for (let todo of data) {
            if (todo.completed) {
                completeHtml += `<li class="collection-item">
                                    ${todo.text} 
                                    <a href="#!" class="secondary-content" onclick="deleteTodo(${todo.id})">
                                        <i class="material-icons red-text">delete</i>
                                    </a>
                                 </li>`;
            } else {
                incompleteHtml += `<li class="collection-item">
                                    ${todo.text} 
                                    <a href="#!" class="secondary-content" onclick="completeTodo(${todo.id})">
                                        <i class="material-icons green-text">check</i>
                                    </a>
                                    <a href="#!" class="secondary-content" style="margin-right: 30px;" onclick="deleteTodo(${todo.id})">
                                        <i class="material-icons red-text">delete</i>
                                    </a>
                                   </li>`;
            }
        }

        $('#incompleteTodos').html(incompleteHtml);
        $('#completedTodos').html(completeHtml);
    });
}



// 當網頁載入完成後，獲取待辦事項清單
$(document).ready(function () {
    fetchTodos();
});
