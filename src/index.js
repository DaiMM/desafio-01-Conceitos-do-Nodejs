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

  if(!user){
    return response.status(404).json({error: "User not found!"})
  }

  request.user = user;

  return next();
}

function checksExistsTodo(request, response, next){
  const{user} = request;

  const param = request.params;

  if(!(user.todos.find((todos) => todos.id === param.id))){

    return response.status(404).json({error: "Todo not found!"});
  }

  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if(userAlreadyExists){
    return response.status(400).json({error: "User already exist!"});
  }

 users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  const objectUser = users.find((users) => users.username === username);

  return response.status(201).json(objectUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;

  const {user} = request;

  const userTodos = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(userTodos);
  
  return response.status(201).json(userTodos);

});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const {user} = request;

  const {title, deadline} = request.body;

  const paramId = request.params;

  const todo = user.todos.find((todos) => todos.id === paramId.id);
  
  todo.title = title; 
  todo.deadline = new Date(deadline);

  return response.json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const {user} = request;

  const paramId = request.params;
  
  const todo = user.todos.find((todos) => todos.id === paramId.id);

  todo.done = true;

  return response.json(todo);
  
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const {user} = request;

  const paramId = request.params;

  const indexObjetc = user.todos.findIndex((todos) => todos.id === paramId.id);

  user.todos.splice(indexObjetc,1)

   return response.status(204).send();

});

module.exports = app;