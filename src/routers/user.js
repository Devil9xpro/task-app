const express = require('express')
const router = new express.Router()
const User = require('../models/user')

router.post('/users', async (req, res, next) => {
    const user = User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 400
        return next(error)
    }
})

router.post('/users/login', async (req, res, next) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({
            user,
            token
        })
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 400
        return next(error)
    }
})

router.get('/users', async (req, res, next) => {
    try {
        const users = await User.find()
        res.send(users)
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 500
        return next(error)
    }
})

router.get('/users/:id', async (req, res, next) => {
    const _id = req.params.id
    //check if _id is a valid ObjectId
    if (!_id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).send("User's id is not exist !!")
    }
    try {
        user = await User.findById(_id)
        if (!user) {
            return res.status(404).send('This user does not exist')
        }
        res.send(user)
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 500
        return next(error)
    }
})

router.patch('/users/:id', async (req, res) => {
    const _id = req.params.id
    if (!_id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).send("User's id is not exist !!")
    }
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid updates!'
        })
    }
    try {
        const user = await User.findById(_id)
        if (!user) {
            return res.status(404).send()
        }
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/:id', async (req, res) => {
    const _id = req.params.id
    if (!_id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).send("User's id is not exist !!")
    }
    try {
        const user = await User.findByIdAndDelete(_id)
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router