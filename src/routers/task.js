const express = require('express')
const router = new express.Router()
const Task = require('../models/task')

router.post('/tasks', async (req, res,next) => {
    const task = Task(req.body)
    try {
        await task.save()
        res.status(201).send(task)
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 500
        return next(error)
    }
})

router.get('/tasks', async (req, res,next) => {
    try {
        const tasks = await Task.find()
        res.send(tasks)
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 500
        return next(error)
    }
})

router.get('/tasks/:id', async (req, res,next) => {
    const _id = req.params.id
    if (!_id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).send("User's id is not exist !!")
    }
    try {
        const task = await Task.findById(_id)
        if (!task) {l
            return res.status(404).send()
        }
        res.send(task)
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 400
        return next(error)
    }
})

router.patch('/tasks/:id', async (req, res,next) => {
    const _id = req.params.id
    if (!_id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).send("User's id is not exist !!")
    }
    updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid updates!'
        })
    }
    try {
        const task = await Task.findById(_id)
        if (!task) {
            return res.status(404).send()
        }
        updates.forEach(update => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 400
        return next(error)
    }
})

router.delete('/tasks/:id', async (req, res) => {
    const _id = req.params.id
    if (!_id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).send("User's id is not exist !!")
    }
    try {
        const task = await Task.findByIdAndDelete(_id)
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        const error = new Error(err)
        error.statusCode = 500
        return next(error)
    }
})

module.exports = router