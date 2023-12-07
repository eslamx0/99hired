const mongoose = require('mongoose')
// for more validation to plugin within our mongoose 
const validator = require('validator')

// unique won't work when there is already duplicates in the DB
const jobSchema = new mongoose.Schema({
    // About position
    title: {
        type: String,
        trim: true,
        required: [true, 'A job must have a title']
    },

    workplace_type: {
        type: String,
        required: [true, 'A job must have a workplace type'],
        // enum validator works only for string 
        enum: {
            values: ['remote', 'office', 'hybrid', '-'],
            message: 'The type can only be remote or office or hybrid'
        }
    },

    level: {
        type: String,
        trime: true, 
        required: [true, 'A job must have a level'],
        enum: {
            values: ['intern', 'junior', 'mid-senior', 'senior', 'architect', 'lead', '-'],
            message: 'The entered level is invalid'
        }
    },

    tech: {
        type: String,
        trim: true,
        required: [true, 'A job must have a tech'],
        enum: {
            values: ['javascript', 'python', 'ruby', 'java', 'c#', 'go', 'php', '-'],
            message: 'The entered stack is invalid'

        }
    },

    description: {
        type: String, 
        trim: true,
        required: [true, 'A job must have a description']
    },

    company: {
        type: String,
        trim: true,
        required: [true, 'A job must have a company']
    },

    email: {
        type: String,
        trim: true,
        required: [true, 'A company must have an email'],
        validate: [validator.isEmail, 'Invalid email address']
    },

    website: {
        type: String,
        trim: true
    },

    location: {
        type:String,
        trim: true,
        required: [true, 'A job must have a location']
    },

    application: {
        type: String,
        trim: true,
        required: [true, 'A job must have an application link or email']
    },

    created_at: {
        type: Date,
        default: function(){
            return new Date(Date.now() + 3*60*60*1000)
        }
    },
// 
    revised: {
        type: Boolean,
        default: false
    },

    slug: {
        type: String,
        required: true,
        unique: true,
      }
}
)

const Job = mongoose.model('Job', jobSchema)

module.exports = Job