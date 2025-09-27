const { getPool, sql } = require('../db');

exports.getAll = async (req, res, next) => {
  try {
    const pool = await getPool();
    const rs = await pool.request().query(`
      SELECT tc.CostID, tc.FromDestinationID, f.Name AS FromName,
             tc.ToDestinationID, t.Name AS ToName, tc.Cost
      FROM TravelCosts tc
      JOIN Destinations f ON f.DestinationID = tc.FromDestinationID
      JOIN Destinations t ON t.DestinationID = tc.ToDestinationID
      ORDER BY tc.FromDestinationID, tc.ToDestinationID
    `);
    res.json(rs.recordset);
  } catch (err) { next(err); }
};

exports.upsert = async (req, res, next) => {
  try {
    const { FromDestinationID, ToDestinationID, Cost } = req.body;
    const pool = await getPool();
    await pool.request()
      .input('FromDestinationID', sql.Int, FromDestinationID)
      .input('ToDestinationID', sql.Int, ToDestinationID)
      .input('Cost', sql.Float, Cost)
      .query(`
        IF EXISTS (SELECT 1 FROM TravelCosts
                   WHERE FromDestinationID=@FromDestinationID AND ToDestinationID=@ToDestinationID)
          UPDATE TravelCosts
            SET Cost=@Cost
          WHERE FromDestinationID=@FromDestinationID AND ToDestinationID=@ToDestinationID;
        ELSE
          INSERT INTO TravelCosts (FromDestinationID, ToDestinationID, Cost)
          VALUES (@FromDestinationID, @ToDestinationID, @Cost);
      `);
    res.status(200).json({ message: 'OK' });
  } catch (err) { next(err); }
};
