const { getPool, sql } = require('../db');

exports.getAll = async (req, res, next) => {
  try {
    const pool = await getPool();
    const rs = await pool.request().query('SELECT * FROM Destinations ORDER BY DestinationID');
    res.json(rs.recordset);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { Name, Lat = null, Lng = null, Description = null } = req.body;
    const pool = await getPool();
    const rs = await pool.request()
      .input('Name', sql.NVarChar, Name)
      .input('Lat', sql.Float, Lat)
      .input('Lng', sql.Float, Lng)
      .input('Description', sql.NVarChar, Description)
      .query(`
        INSERT INTO Destinations (Name, Lat, Lng, Description)
        VALUES (@Name, @Lat, @Lng, @Description);
        SELECT SCOPE_IDENTITY() AS DestinationID;
      `);
    res.status(201).json({ DestinationID: rs.recordset[0].DestinationID });
  } catch (err) { next(err); }
};
