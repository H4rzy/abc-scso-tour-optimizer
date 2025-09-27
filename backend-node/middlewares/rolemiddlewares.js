
// HIGH ORDER: xuat 1 ham nhan tham so,khi goi thi truyen vao role yeu cau thi no se tra lai 1 middleware thuc thi khi request toi
module.exports = role => (req,resizeBy,next) =>
{
    if(req.user.role !== role)
        return res.status(403).json({error: 'không đủ quyền!'});
    
    //neu dung thi cho phep qua controller
    next();
}