const mongoose = require('mongoose')
const validator = require('validator')

const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        required: [true, 'Email address is required'],
        validate: [validator.isEmail, 'Invalid email address']
    }
})

const Newsletter = mongoose.model('Newsletter', newsletterSchema)

module.exports = Newsletter