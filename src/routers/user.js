const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')

router.post('/users', async (req, res, next) => {
    const user = User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({
            user,
            token
        })
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

router.post('/users/logout', auth, async (req, res, next) => {
    //log out from specific token from tokens in user
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (err) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res, next) => {
    //logout from all tokens in user
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (err) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res, next) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res, next) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid updates!'
        })
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 400
        return next(error)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error('Please upload an image!!'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({
        width: 250,
        height: 250
    }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (err, req, res, next) => {
    res.status(400).send({
        error: err.message
    })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error("User or User's image is not existed")
        }
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (err) {
        const error = new Error(err)
        error.statusCode = 404
        return next(error)
    }
})

module.exports = router