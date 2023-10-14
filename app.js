$(document).ready(function () {
    fetchTodos(); // 當文件載入完成後，呼叫 fetchTodos 函式
    $('.datepicker').datepicker(); // 初始化所有 class 為 datepicker 的元素
    $('select').formSelect(); // 初始化所有 select 元素
});

function addTodo() {
    let todoText = $('#todoInput').val(); // 取得 id 為 todoInput 的 input 元素的值
    let todoDate = $('#todoDate').val(); // 取得 id 為 todoDate 的 input 元素的值
    let todoUrgency = $('#todoUrgency').val(); // 取得 id 為 todoUrgency 的 select 元素的值

    // 透過 POST 請求將新的 todo 項目加入到伺服器
    $.post('/add_todo', { text: todoText, date: todoDate, urgency: todoUrgency }, function (data) {
        $('#todoInput').val(''); // 清空 id 為 todoInput 的 input 元素的值
        $('#todoDate').val(''); // 清空 id 為 todoDate 的 input 元素的值
        $('#todoUrgency').val('1'); // 將 id 為 todoUrgency 的 select 元素的值設為 1
        fetchTodos(); // 呼叫 fetchTodos 函式更新 todo 清單
    });
}

// 刪除待辦事項的函數
function deleteTodo(id) {
    console.log('deleteTodo function called with ID:', id);
    // 發送AJAX POST請求到後端，刪除指定的待辦事項
    $.post('/delete_todo', { id: id }, function (data) {
        fetchTodos();  // 重新獲取待辦事項清單
    });
}

function fetchTodos() {
    $.get('/get_todos', function (data) {
        let incompleteHtml = ''; // 未完成的 todo 項目的 HTML 字串
        let completeHtml = ''; // 已完成的 todo 項目的 HTML 字串

        for (let todo of data) {
            let urgencyTag = ''; // 初始化緊急程度標籤

            if (todo.completed) { // 如果 todo 項目已完成
                if (todo.urgency === '1') {
                    urgencyTag = '!';
                } else if (todo.urgency === '2') {
                    urgencyTag = '!!';
                } else if (todo.urgency === '3') {
                    urgencyTag = '!!!';
                }

                completeHtml += `<li class="collection-item">${todo.text} 
                                 <span class="grey-text">(${todo.date})</span> <span class="badge">${urgencyTag}</span>
                                 <a href="#!" onclick="openEditModal('${todo.id}', '${todo.text}', '${todo.date}', '${urgencyTag}')" class="secondary-content">
                                     <i class="material-icons teal-text">edit</i>
                                 </a>
                                 <a href="#!" class="secondary-content">
                                     <i class="material-icons red-text delete-todo-btn" data-todo-id="${todo.id}">delete</i>
                                 </a>
                                 </li>`;
            } else { // 如果 todo 項目未完成 
                if (todo.urgency === '1') {
                    urgencyTag = '!';
                } else if (todo.urgency === '2') {
                    urgencyTag = '!!';
                } else if (todo.urgency === '3') {
                    urgencyTag = '!!!';
                }

                incompleteHtml += `<li class="collection-item">${todo.text} 
                                   <span class="grey-text">(${todo.date})</span> <span class="badge">${urgencyTag}</span>
                                   <a href="#!" onclick="openEditModal('${todo.id}', '${todo.text}', '${todo.date}', '${urgencyTag}')" class="secondary-content">
                                     <i class="material-icons teal-text">edit</i>
                                   </a>
                                   <a href="#!" class="secondary-content">
                                       <i class="material-icons green-text complete-todo-btn" data-todo-id="${todo.id}">check</i>
                                   </a>
                                   <a href="#!" class="secondary-content" style="margin-right: 30px;">
                                       <i class="material-icons red-text delete-todo-btn" data-todo-id="${todo.id}">delete</i>
                                   </a>
                                   </li>`;
            }
        }

        $('#incompleteTodos').html(incompleteHtml);
        $('#completedTodos').html(completeHtml);
    });
}



function completeTodo(id) {
    console.log('completeTodo function called with ID:', id);
    $.post('/complete_todo', { id: id }, function (data) {
        fetchTodos(); // 呼叫 fetchTodos 函式更新 todo 清單
    });
    $('.todo-text').on('blur', function () {
        let id = $(this).parent().data('id');
        let newText = $(this).text();
        updateTodo(id, 'text', newText);
    });

    $('.todo-date').on('blur', function () {
        let id = $(this).parent().data('id');
        let newDate = $(this).text().replace(/[\(\)]/g, ''); // 移除括號
        updateTodo(id, 'date', newDate);
    });
}

// 更新待辦事項的函數，第一個參數為待辦事項的 ID，第二個參數為要更新的欄位，第三個參數為新的值
function updateTodo(id, field, value) {
    $.post('/update_todo', { id: id, field: field, value: value }, function (data) {
        fetchTodos();
    });
}
document.querySelector(".container").addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("delete-todo-btn")) {
        console.log("Delete button clicked");
        deleteTodo(e.target.getAttribute("data-todo-id"));
    }
    if (e.target && e.target.classList.contains("complete-todo-btn")) {
        console.log("Complete button clicked");
        completeTodo(e.target.getAttribute("data-todo-id"));
    }
});

function openEditModal(id, text, date, urgency) {
    $('#editModal').modal('open');
    $('#editTodoInput').val(text);
    $('#editTodoDate').val(date);
    $('#editTodoUrgency').val(urgency);
    $('#editTodoInput').data('id', id);  // Store the todo id for later use
}

function editTodo() {
    let todoId = $('#editTodoInput').data('id');
    let todoText = $('#editTodoInput').val();
    let todoDate = $('#editTodoDate').val();
    let todoUrgency = $('#editTodoUrgency').val();

    $.post('/edit_todo', { id: todoId, text: todoText, date: todoDate, urgency: todoUrgency }, function (data) {
        if (data.success) {
            fetchTodos(); // Refresh the todos list
        } else {
            alert('Error editing todo: ' + data.message);
        }
    });
}
$(document).ready(function () { $('#editModal').modal(); });