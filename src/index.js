const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not exists" })
}

request.user = user;

return next();
}
  

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const userAlreadyExists = users.find(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const user = {
    id: uuidv4(), 
	name: name, 
	username: username, 
	todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
 
 const {user} = request;

 return response.status(201).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;

  const {user} = request;

  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline),   
    created_at: new Date()
  };

  users.map(userMap => {
    userMap.username === user.username && user.todos.push(todo);
  })

  return response.status(201).json(todo)
});



app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const {title, deadline} = request.body;

 const todoExists = user.todos.find(userTodo => userTodo.id === id);

 if (!todoExists) {
  return response.status(404).json({ error: "Todo not exists" })
 }

 const todoEddited = {
             id: todoExists.id,
             title,
             done: todoExists.done, 
             deadline: new Date(deadline),   
             created_at: todoExists.created_at
 }

 const todoFiltered = user.todos.filter(todos => todos.id !== id);

 todoFiltered.push(todoEddited)

 users.map(userMap => {
  if(userMap.username === user.username) {
    userMap.todos = todoFiltered;
  }
 })

 return response.status(200).json(todoEddited);
  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todoExists = user.todos.find(userTodo => userTodo.id === id);

 if (!todoExists) {
  return response.status(404).json({ error: "Todo not exists" })
 }

 const todoEddited = {
  id: todoExists.id,
  title: todoExists.title,
  done: true, 
  deadline: todoExists.deadline,   
  created_at: todoExists.created_at
}

const todoFiltered = user.todos.filter(todos => todos.id !== id);

todoFiltered.push(todoEddited)

users.map(userMap => {
if(userMap.username === user.username) {
userMap.todos = todoFiltered;
}
})

return response.status(200).json(todoEddited);


});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todoExists = user.todos.find(userTodo => userTodo.id === id);

 if (!todoExists) {
  return response.status(404).json({ error: "Todo not exists" })
 }

const todoFiltered = user.todos.filter(todos => todos.id !== id);

users.map(userMap => {
  if(userMap.username === user.username) {
  userMap.todos = todoFiltered;
  }
  })
  
  return response.status(204).send();
});

module.exports = app;