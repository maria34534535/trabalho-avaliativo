const express = require('express');
const healthRoutes = require("./routes/health");
const userRouter = require('./routes/users');
const recipesRouter = require('./routes/recipes');
const server = express();

server.use(express.json());
server.use(healthRoutes.router);
server.use(userRouter.router);
server.use(recipesRouter.router);

module.exports = { server };
