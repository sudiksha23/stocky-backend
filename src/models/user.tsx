const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        minLength: 4, // ensures firstName must be of more than 4 characters
        maxLength: 20, // ensures firstName must be of less than 20 characters
    },
    lastName: { 
        type: String, 
        required: true 
    },
	email: { 
        type: String, 
        required: true,
        unique: true,  // unique identifier check, email id must not be duplicated 
        lowercase: true,  // it will convert all value for this field to lowercase
        trim: true // it will remove pre and post white spaces for this value
    },
    password: { 
        type: String,
        required: true, 
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User