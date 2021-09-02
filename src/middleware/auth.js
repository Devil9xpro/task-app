const jwt = require('jsonwebtoken')
const User = require('../models/user')
const dotenv = require('dotenv').config()

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer', '').trim()
        const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY)
        const user = await User.findOne({
            _id: decoded._id,
            //mongoose syntax to get token from tokens
            'tokens.token': token
        })
        if (!user) {
            throw new Error('Please authorize')
        }
        req.token = token
        req.user = user
        next()
    } catch (err) {
        console.log(err)
        const error = new Error(err)
        error.statusCode = 401
        return next(error)
    }
}

module.exports = auth