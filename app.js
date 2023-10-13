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

function fetchTodos() {
    $.get('/get_todos', function (data) {
        let incompleteHtml = ''; // 未完成的 todo 項目的 HTML 字串
        let completeHtml = ''; // 已完成的 todo 項目的 HTML 字串

        for (let todo of data) {
            if (todo.completed) { // 如果 todo 項目已完成
                completeHtml += `<li class="collection-item">${todo.text} 
                                 <a href="#!" class="secondary-content" onclick="deleteTodo(${todo.id})">
                                     <i class="material-icons red-text">delete</i>
                                 </a>
                                 </li>`; // 將已完成的 todo 項目加入 completeHtml 字串
            } else { // 如果 todo 項目未完成
                incompleteHtml += `<li class="collection-item">${todo.text} 
                                   <span class="grey-text">(${todo.date})</span>
                                   <a href="#!" class="secondary-content" onclick="completeTodo(${todo.id})">
                                       <i class="material-icons green-text">check</i>
                                   </a>
                                   <a href="#!" class="secondary-content" style="margin-right: 30px;" onclick="deleteTodo(${todo.id})">
                                       <i class="material-icons red-text">delete</i>
                                   </a>
                                   </li>`; // 將未完成的 todo 項目加入 incompleteHtml 字串
            }
        }

        $('#incompleteTodos').html(incompleteHtml); // 將 incompleteHtml 字串設為 id 為 incompleteTodos 的元素的 HTML 內容
        $('#completedTodos').html(completeHtml); // 將 completeHtml 字串設為 id 為 completedTodos 的元素的 HTML 內容
    });
}

function completeTodo(id) {
    $.post('/complete_todo', { id: id }, function (data) {
        fetchTodos(); // 呼叫 fetchTodos 函式更新 todo 清單
    });
}

function deleteTodo(id) {
    $.post('/delete_todo', { id: id }, function (data) {
        fetchTodos(); // 呼叫 fetchTodos 函式更新 todo 清單
    });
}