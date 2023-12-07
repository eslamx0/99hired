const { default: axios } = require('axios')
const Job = require('../models/jobModel')
const Transaction = require('../models/transactionModel')
const ApiFeatures = require('../utils/apiFeatures')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const generateSlug = require('../utils/generateSlug')


exports.getAllJobs = catchAsync(
    async (req, res, next) => {
    
        let query = Job.find({})
        const queryString = req.query

        const apiFeatures = new ApiFeatures(query, queryString)
        apiFeatures
            .filter()
            .sort()
            .limitFields()
            .paginate()

        query = apiFeatures.query

        // pre find hook middleware will be executed beore this find query executed 
        // you will find that in GetAll
        const jobs = await query

        return res.status(200).render('jobs', {
            jobs
        })
    }
)


exports.getLastAddedJobs = catchAsync(
    async (req, res, next) => {
        let query = Job.find({}).sort({ createdAt: -1 }).limit(40); // Sort by createdAt in descending order and limit to 40 items.
        const queryString = req.query

        const apiFeatures = new ApiFeatures(query, queryString)
        apiFeatures
            .filter()
            .sort()
            .limitFields()
            .paginate()

        query = apiFeatures.query

        // pre find hook middleware will be executed beore this find query executed 
        // you will find that in GetAll
        const jobs = await query

        return res.status(200).render('jobs', {
            jobs
        })



        
    }
)

exports.getJob = catchAsync(
    async (req, res, next) => {
        const id = req.params.id
        // An error coming from the next line won't have isOperational and will
        // be caught in catchAsync
        const job = await Job.findById(id)

        // note that no error will be resulted if didn't find the job to get or update
        // or delete
        if(!job) {
            // we say here return as without it the code will continue to execute
            // and then after that the global error will be called after finishing 
            // this function, which will result an error as we try to set headers
            // again into the global error
            return next(new AppError('No job found with that ID', 404))
        }

        res.status(200).json({
            status: 'success',
            data: {
                job
            }
        })
    }
)

exports.validateJob = catchAsync(
    async (req, res, next) => {

        const postedJobData = req.body
        const slug = await generateSlug(postedJobData)
        postedJobData.slug = slug
        const job = new Job(postedJobData)
        await job.validate();

        res.status(201).json({
            status: 'success',
            data: {
                postedJobData
            }
        })
    }
)



exports.createJob = catchAsync(
    async (req, res, next) => {


        const validatedJob = req.body.validatedJobData
        const transactionId = req.body.transactionId
        const transaction = await Transaction.findOne({transactionId})
        
        if(transaction && validatedJob) {
            const slug = await generateSlug(validatedJob)
            validatedJob.slug = slug
    
            const createdJob = await Job.create(validatedJob)
    
            // Delete the transaction Id
            await Transaction.deleteOne({transactionId})

            res.status(201).json({
                status: 'success',
                data: {
                    job: createdJob
                }
            })

        } else {
            res.status(404).json({
                status: 'error',
                message: 'Either Job or Transaction not found'
            })
        }
    }
)


exports.createFreeJob = catchAsync(
    async (req, res, next) => {


        const validatedJob = req.body.validatedJobData
        
        if(validatedJob) {
            const slug = await generateSlug(validatedJob)
            validatedJob.slug = slug
    
            const createdJob = await Job.create(validatedJob)

            res.status(201).json({
                status: 'success',
                data: {
                    job: createdJob
                }
            })

        } else {
            res.status(404).json({
                status: 'error',
                message: 'Job Not Created'
            })
        }
    }
)

exports.scrapJobs = catchAsync(
    async(req, res, next) => {

        const response = await axios.get('http://127.0.0.1:3000/jobs')
        
        const {jobsData} = response.data.data

        for(let job of jobsData) {
            if(job) {
                const slug = await generateSlug(job)
                job.slug = slug
                await Job.create(job)
            }
        }


        res.status(201).json({
            status: 'success',
        })
        
    }
)












exports.updateJob = catchAsync(
    async (req, res, next) => {

        
        const id = req.params.id;
        const update = req.body
        const job = await Job.findByIdAndUpdate(id, update, {
            new: true,
            // To make sure to run validators, if we didn't run validators
            // data will be forced
            runValidators: true
        })

        // note that no error will be resulted if didn't find the job to get or update
        // or delete
        if(!job) {
            return next(new AppError('No job found with that ID', 404))
        }
    
        res.status(200).json({
            status: 'success',
            data: {
                job
            }
        })
    }
)

exports.deleteJob = catchAsync(
    async (req, res, next) => {
        const id = req.params.id
        const job = await Job.findByIdAndDelete(id)

        // note that no error will be resulted if didn't find the job to get or update
        // or delete
        if(!job) {
            return next(new AppError('No job found with that ID', 404))
        }

        res.status(204).json({
            status: 'success',
        })
    }
)
