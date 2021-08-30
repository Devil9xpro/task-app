const mongoose = require('mongoose')
const validator = require('validator')
const dotenv = require('dotenv').config()
const chalk = require('chalk')

mongoose.connect(process.env.MONGODB_URI)
    .then(result => {
        console.log(chalk.yellow.inverse('Connect successfully to mongo database!!'))
    })
    .catch(err => {
        console.log(chalk.red.inverse('Cannot connect to database!!'))
    })


