class AppError extends Error {
    constructor(message, code) {
        super(message)
        this.statusCode = code
        this.status = `$code`.startsWith('4') ? 'fail' : 'error'

        this.isOperational = true

        // this creates stack property but we don't need it here as it is created
        // by default
        // you can see this: https://stackoverflow.com/questions/63598211/how-to-use-error-capturestacktrace-in-node-js
        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = AppError