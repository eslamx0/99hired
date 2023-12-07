const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: [true, 'Transaction Id is required']
    }
})

const Transaction = mongoose.model('Transaction', transactionSchema)

module.exports = Transaction