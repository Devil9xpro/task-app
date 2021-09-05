const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/task')

router.post('/tasks', auth, async (req, res, next) => {
    try {
        const task = new Task({
            ...req.body,
            owner: req.user._id
        })
        await task.save()
        res.status(201).send(task)
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 500
        return next(error)
    }
})


//GET /tasks?completed=true
//GET /tasks?limit=10&skip=0
router.get('/tasks', auth, async (req, res, next) => {
    const match = {}
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    const findOptions = {
        limit: 1,
        skip: 0
    }
    if (req.query.limit) {
        findOptions.limit = parseInt(req.query.limit)
    }
    if (req.query.skip) {
        findOptions.skip = parseInt(req.query.skip)
    }
    console.log(findOptions)
    try {
        const tasks = await Task.find({
            owner: req.user._id,
            ...match
        }, null, findOptions)
        console.log(tasks)
        res.send(tasks)
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 500
        return next(error)
    }
})

router.get('/tasks/:id', auth, async (req, res, next) => {
    const _id = req.params.id
    if (!_id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).send("User's id is not exist !!")
    }
    try {
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 400
        return next(error)
    }
})

router.patch('/tasks/:id', auth, async (req, res, next) => {
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
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        })
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

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    if (!_id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).send("User's id is not exist !!")
    }
    try {
        const task = await Task.findOneAndDelete({
            _id,
            owner: req.user._id
        })
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