const express = require('express')
const chalk = require('chalk')
const dotenv = require('dotenv').config()

require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log(chalk.green.inverse('Server is up on port ' + port))
})