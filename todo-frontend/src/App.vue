
<template>
    <div id="app">
        <h1>待辦事項</h1>
        <input v-model="newTodo" @keyup.enter="addTodo" placeholder="新增待辦事項">
        <ul>
            <li v-for="todo in todos" :key="todo.id">
                <input type="checkbox" v-model="todo.completed">
                <span>{{ todo.text }}</span>
                <button @click="deleteTodo(todo.id)">刪除</button>
            </li>
        </ul>
    </div>
</template>

<script>
import axios from 'axios';

// Set the base URL for Axios
axios.defaults.baseURL = 'http://127.0.0.1:5000';

export default {
    data() {
        return {
            todos: [],
            newTodo: ''
        };
    },
    async mounted() {
        const response = await axios.get('/todos');
        this.todos = response.data;
    },
    methods: {
        async addTodo() {
            const response = await axios.post('/todos', { text: this.newTodo });
            this.todos.push(response.data);
            this.newTodo = '';
        },
        async deleteTodo(id) {
            await axios.delete(`/todos/${id}`);
            this.todos = this.todos.filter(todo => todo.id !== id);
        }
    }
};
</script>
