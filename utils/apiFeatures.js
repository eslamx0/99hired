class ApiFeatures {
    constructor(query, queryString) {
        this.query = query;
        // queryString is req.query
        this.queryString = queryString
    }


    filter() {
        let queryObj = {...this.queryString}

        // Execluding fields
        const execludedFields = ['page', 'sort', 'limit', 'fields']
        execludedFields.forEach( el => delete queryObj[el])

        // altering queryObj to be an appropiate filter obj that can be passed to find
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)
        queryObj = JSON.parse(queryStr)


        for(const key in queryObj){
            if(queryObj[key] === ''){
                delete queryObj[key]
            }
        }

        // find returns an array of jobs and converts them to js objects
        this.query =  this.query.find(queryObj)

        return this
    }

    sort() {
        if(this.queryString.sort) {
            const sort_by = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sort_by)
        } else {
            this.query = this.query.sort('-created_at')
        }

        // so that we can chain methods
        return this
    }

    limitFields() {
        if(this.queryString.fields){
            let fields = this.queryString.fields.split(',').join(' ')
            console.log(fields)
            try {

            this.query = this.query.select(fields)
                
            } catch (error) {
                console.log(error)   
            }
        }

        return this
    }

    paginate() {
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 100
        // for example: page 3 and limit 4 => skip(8) => skip(3-1 * 4) => skip((page-1) * limit)
        const skip = (page - 1) * limit

        this.query = this.query.skip(skip).limit(limit)

        return this
    }
}

module.exports = ApiFeatures