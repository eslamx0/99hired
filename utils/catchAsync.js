module.exports = fn =>{
    return (req, res, next) => {
        // next here is a shortcut for this callback function (error)=> next(error)
        
        fn(req, res, next).catch(error => next(error))
    }
}
