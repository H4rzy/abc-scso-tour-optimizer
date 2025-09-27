const {getPool,sql} = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'User' } = req.body;
    const pool = await getPool();
    const hashed = await bcrypt.hash(password, 10);

    await pool.request()
      .input('Name', sql.NVarChar, name)
      .input('Email', sql.VarChar, email)
      .input('PasswordHash', sql.NVarChar, hashed)
      .input('Role', sql.NVarChar, role)
      .query('INSERT INTO Users (Name, Email, PasswordHash, Role) VALUES (@Name, @Email, @PasswordHash, @Role)');

    res.status(201).json({ message: 'Đăng ký thành công!' });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('Email', sql.VarChar, email)
      .query('SELECT TOP 1 * FROM Users WHERE Email=@Email');

    const user = result.recordset[0];
    if (!user) return res.status(404).json({ error: 'Email không tồn tại!' });

    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match) return res.status(401).json({ error: 'Sai mật khẩu!' });

    const token = jwt.sign({
      id: user.UserID || user.Id, email: user.Email, role: user.Role
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) { next(err); }
};
