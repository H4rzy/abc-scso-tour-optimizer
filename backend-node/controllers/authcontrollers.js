const {getPool,sql} = require('../../db');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

//req: nhan du lieu tu client
// res: gui phan hoi
//next: gui loi cho middleware xu ly

exports.register = async (req, res,next) =>
{
    try
    {
        // lay name,email... trong body
        const {name, email, password} = req.body;

        // lay du lieu tu sql
        const pool = await getPool();

        // hash mat khau
        const hashed = await bcrypt.hash(password,10);
        
        // tao 1 request sql
        await pool.request()
        //truyen bien @ de tranh sql injection!!!!!
        .input('Name',sql.NVarChar,name)
        .input('Email',sql.VarChar,email)
        .input('Password',sql.NVarChar,hashed)
        //cau lenh sql
        .query('INSERT INTO Users (Name,Email,Password) VALUES (@Name,@Email,@Password)');
        
        //phan hoi lai (201 la tao moi thanh cong)
        res.status(201).json({message: 'đăng ký thành công!'});

    }
    catch(err)
    {
        next(err);
    }

};


exports.login = async (req,res,next) =>
{
    try
    {
    const {email,password} = req.body;   

    const pool = await getPool();

    const result = await pool.request()
    .input('Email',sql.VarChar,email)
    .query('SELECT * FROM Users WHERE Email=@Email');

    //kiem tra user co ton tai hay khum

    //recordset nghia la lay dong du lieu dau tien
    const user = result.recordset[0];
    if(!user) return res.status(404).json({error:'Email ko ton tai!'});

    //kiem tra passowrd voi plaintext
    const match = await bcrypt.compare(password,user.password);
    //(401) unauthorized
    if(!match) return res.status(401).json({error:'Sai mật khẩu!'});


    //tao token de gui di
    const token = jwt.sign(
        {
            id: user.Id,
            email: user.Email,
            role: user.Role
            //su dung khoa bi mat tu env va het han trong 1h
        }, process.env.JWT_SECRET,{expiresIn:'1h'}
    );
    //tra token cho user
    res.json({token});
}
catch(err)
{
    next(err);
}
}
