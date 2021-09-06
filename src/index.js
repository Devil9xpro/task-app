const express = require('express')
const chalk = require('chalk')
const dotenv = require('dotenv').config()
const multer = require('multer')

require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.use((error, req, res, next) => {
    console.log(chalk.red.inverse(error));
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).send({ message: message, data: data });
  });

app.listen(port, () => {
    console.log(chalk.green.inverse('Server is up on port ' + port))
})