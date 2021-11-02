const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checkExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "Usuário não cadastrado" });
  }

  request.user = user;
  return next();
}

function checksExistsUserName(request, response, next) {
  const { username } = request.body;
  const user = users.find((user) => user.username === username);

  if (user) {
    return response.status(400).json({ error: "Usuário já existe" });
  }
  request.user = user;
  return next();
}

function checksExistsTodoUser(request, response, next) {
  const { username } = request.body;
  const { id } = request.params;

  const user = users.find((user) => user.username === username);
  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo inexistente!" });
  }

  req.user = user;

  return next();
}

app.post("/users", checksExistsUserName, (request, response) => {
  const { name, username } = request.body;
  const object = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(object);

  return response.status(201).json(object);
});

app.get("/todos", checkExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(201).json(user.todos);
});

app.post("/todos", checkExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const object = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(object);
  return response.status(201).json(object);
});

app.put(
  "/todos/:id",
  checkExistsUserAccount,
  (request, response) => {
    const { title, deadline } = request.body;
    const { id } = request.params;
    const { user } = request;

    const todo = user.todos.find((todo) => todo.id === id);

    if (!todo) {
      return response.status(404).json({ error: "Todo inexistente!" });
    }

    todo.title = title;
    todo.done = false;
    todo.deadline = new Date(deadline);

    return response.json(todo);
  }
);

app.patch(
  "/todos/:id/done",
  checkExistsUserAccount,
  (request, response) => {
    const { id } = request.params;
    const { user } = request;

    const todo = user.todos.find((todo) => todo.id === id);
    
    if (!todo) {
      return response.status(404).json({ error: "Todo inexistente!" });
    }
    todo.done = true;

    return response.json(todo);
  }
);

app.delete("/todos/:id", checkExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const newTodo = [];

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo inexistente!" });
  }

  user.todos.map((todo) => {
    if (todo.id !== id) {
      newTodo.push(todo);
    }
  });

  user.todos = newTodo;

  return response.status(204).send();
});

module.exports = app;
