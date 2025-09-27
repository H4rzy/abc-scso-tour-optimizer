
// HIGH ORDER: xuat 1 ham nhan tham so,khi goi thi truyen vao role yeu cau thi no se tra lai 1 middleware thuc thi khi request toi
module.exports = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role)
    return res.status(403).json({ error: 'Không đủ quyền!' });
  next();
};