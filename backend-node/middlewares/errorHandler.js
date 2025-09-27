module.exports = (err,req,res,next) =>
{
        console.log(err);
        //lay status ra neu ko thi la 500
        const status = err.statusCode|| 500;
        res.status(status).json({error: err.message || 'Internal Server Error!'});
}