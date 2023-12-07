const express = require('express')
const viewsController = require('../controllers/viewsController')
const router = express.Router()

router.get('/', viewsController.getLastAddedJobs)
router.get('/jobs', viewsController.getJobs)
router.get('/jobs/:slug', viewsController.getJob)
router.get('/jobform', viewsController.getJobForm)
router.get('/pricing', viewsController.getPricing)
router.get('/notfound', viewsController.getNOtFound)
// router.get('/paypal', viewsController.getPaypal)

module.exports = router;