const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({path: './config.env'})

const app = require('./app')


// Uncaught exceptions (bugs) are exceptions that comes from sync but were not caught
// console.log(x)
// In uncaught exceptions we really want to process.exit(1)
// as the process is now is in unclean state

// It is important to have this here and not below
// so that we define before the error happens
// imagine this line was here : console.log(x)
process.on('uncaughtException', (error) => {
    // Printing them so that they are shown in the logs of the server
    console.log('Uncaught Exception! Shutting Down')
    console.log(error.name, error.message)


    process.exit(1)

})



DB = process.env.DATABASE_ATLAS

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {console.log('Connected successfully with DB')})
.catch(error => console.log(error))
// if process.env.PORT is undefined port 3000 will be used
const port = process.env.PORT || 3000
const server = app.listen(port, ()=>{
    console.log(`Server started on port: ${port}`)
})


// Each time there is unhandeled rejection somewhere in our application
// process object will emit an object called unhandeled rejection
// unhandled rejection is any rejection that is not caught inside our app
// so if I removed catch async in controller, the process.on will work

// this is a central place to handle all errors not caught


// If you simply call process.exit() to terminate the existing server process, 
// any active client connections will be immediately terminated,
// which could cause issues for the clients and lead to resource leaks on the server.
// Instead, you can use server.close() to stop accepting new client connections and allow any active connections 
// to finish before shutting down the server. This ensures that all clients are properly handled and the
// server resources are cleaned up before the server process is terminated.

// We are closing the app as it has an error right now that won't make
// the app work, assume that you have an db error connection, we now won't enable
// having further requests but in uncaught exceptions we don't do that
// as there we don't need to close() as it is synchronous that means don't 
// come from the client so

// this is only for asynchronous code that wasn't handled and resulted in a rejected promise
// as the name says it is unhandeled rejections => rejections come from async=> promises

// process.on('unhandledRejection', (error) => {
//     // Printing them so that they are shown in the logs of the server
//     console.log('Unhandled Rejection! Shutting Down')
//     console.log(error.name, error.message)


//     server.close(()=> {
//         // 1 means that it wasn't handled
//         // the exit code is set to 1. By convention, an exit code of 0 indicates
//         // a successful termination of the process, while a non-zero exit code
//         // indicates an error or abnormal termination.
//         process.exit(1)
//     })

// })


// We should have a tool in production that
// restarts the application after crashing
// and many hosting servers do that

// Ideally errors should be handled right way they occur


// Assuming that the requests do not require further interaction with the database
// , they are able to complete successfully despite the unhandled rejection. Once 
// all of the active connections have been closed and the requests have completed, the server process
// is terminated with an error exit code.
// In this scenario, even though an unhandled rejection occurred and caused the server to shut down,
// the existing requests were able to complete before the server process ended. This helps to minimize
// the impact on users and prevent any potential data loss or corruption.
