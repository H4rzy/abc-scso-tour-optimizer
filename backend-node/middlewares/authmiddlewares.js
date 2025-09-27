const jwt = require('jsonwebtoken');

module.exports = (req,res,next) =>
{
    // lay header authorization tu req
    const authHeader = req.headers.authorization;

    // kiem tra co dung format bearer token ko
    if(!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({error:'ko có token nào được cấp'});

    // token se gui o dang:
    // Authorization: Bearer eyJhbGciO...
    // tach ra thanh ['Bearer',{token}] roi lay phan tu thu 1
    const token = authHeader.split(' ')[1];

    try 
    {
        // kiem tra token co bi edited hay expired ko
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        // neu hop le tri tra ve dang {id, email, role}
        req.user = decoded;
        //chuyen tiep den route handler
        next();
    }
    catch(err)
    {
        res.status(403).json({error: 'Token ko hợp lệ!'});
    }
}