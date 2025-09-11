// route to create users directly -> at http://localhost:7777/addUser
// right now no login authentication is added for users

const express = require('express')
const userRouter = express.Router()
const User = require('../models/user.tsx')

userRouter.post('/addUser', async (req, res, next) => {
    try {
        const {
            firstName, lastName, email, password
        } = req.body
        const user = new User({firstName, lastName,email,password})
        await user.save()
        res.send("User created successfully")
    } catch(error) {
        res.status(400).send("Error saving data "+ error.message)
    }
})

module.exports = userRouter