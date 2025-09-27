const express = require('express');

//kiem tra du lieu tu client
const {body,validationResult} = require('express-validator');

// dinh gnhia cac route con
const router = express.Router();

//chua logic dang nhap
const authController = require('../controllers/authcontrollers');

//ham validate loi
function validate (req,res,next) 
{
    //lay ket qua tu validate middleware    
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({message: errors.array()});
    next();
}


//khi client gửi POST /register
// body name,email,password 
//check tat ca neu ko hop le thi tra ve loi 400, hop le thi goi authcontroller de xuly dang ky
router.post('/register',
    [
        body('name').notEmpty().withMessage('Tên không đc để trống'),
        body('email').isEmail().withMessage('Email ko hợp lệ'),
        body('password').isLength({min:6}).withMessage('mật khẩu phải >= 6 ký tự')
    ],validate,authController.register
);


//khi client gui POST /login check xem co hop le ko...
router.post('/login'
    [
        body('email').isEmail().withMessage('Email ko hợp lệ'),
        body('password').notEmpty().withMessage('mật khẩu phải >= 6 ký tự')
    ],validate,authController.login
)

module.exports = router;
