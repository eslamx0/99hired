const slugify = require('slugify')
const Job = require('../models/jobModel')

module.exports = async (postedJob) => {

    // Generate the initial slug from the title
    let slug = slugify(postedJob.title, { lower: true });

    let count = 1;
    let uniqueSlug = slug;

    
    let existingJob = await Job.findOne({ slug: uniqueSlug });

    while(existingJob){
        uniqueSlug = `${slug}-${count}`;
        count++;
        existingJob = await Job.findOne({ slug: uniqueSlug });
    }

    return uniqueSlug
};







