const express = require('express');
const jobController = require('../controllers/jobController')

const router = express.Router();

    
router
    .route('/')
    .get(jobController.getLastAddedJobs)
    .post(jobController.createJob)

router.route('/createFreeJob').post(jobController.createFreeJob)

router
    .route('/:id')
    .get(jobController.getJob)
    // .patch(jobController.updateJob)
    // .delete(jobController.deleteJob)


router.post('/validateJob', jobController.validateJob)
router.post('/scrapJobs', jobController.scrapJobs)



module.exports = router