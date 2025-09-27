const { getPool, sql } = require('../db');

exports.listTours = async (req, res, next) => {
  try {
    const pool = await getPool();
    const rs = await pool.request()
      .query('SELECT TourID, TourName, CreatedAt, TotalCost FROM Tours ORDER BY TourID DESC');
    res.json(rs.recordset);
  } catch (err) { next(err); }
};

exports.getTourDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const tour = await pool.request()
      .input('TourID', sql.Int, id)
      .query('SELECT TOP 1 * FROM Tours WHERE TourID=@TourID');

    const steps = await pool.request()
      .input('TourID', sql.Int, id)
      .query(`
        SELECT ts.StepID, ts.StepOrder, ts.DestinationID, d.Name, d.Lat, d.Lng, ts.ArrivalTime
        FROM TourSteps ts
        JOIN Destinations d ON d.DestinationID = ts.DestinationID
        WHERE ts.TourID=@TourID
        ORDER BY ts.StepOrder ASC
      `);

    res.json({ tour: tour.recordset[0], steps: steps.recordset });
  } catch (err) { next(err); }
};

exports.saveTour = async (req, res, next) => {
  // body: { TourName, TotalCost, Steps: [DestinationID,...] }
  try {
    const { TourName, TotalCost, Steps = [] } = req.body;
    const pool = await getPool();
    const tx = new sql.Transaction(await getPool());
    await tx.begin();

    try {
      const req1 = new sql.Request(tx);
      const rs = await req1
        .input('TourName', sql.NVarChar, TourName)
        .input('TotalCost', sql.Float, TotalCost)
        .query(`
          INSERT INTO Tours (TourName, TotalCost)
          VALUES (@TourName, @TotalCost);
          SELECT SCOPE_IDENTITY() AS TourID;
        `);
      const TourID = rs.recordset[0].TourID;

      for (let i = 0; i < Steps.length; i++) {
        const r = new sql.Request(tx);
        await r
          .input('TourID', sql.Int, TourID)
          .input('StepOrder', sql.Int, i + 1)
          .input('DestinationID', sql.Int, Steps[i])
          .query(`
            INSERT INTO TourSteps (TourID, StepOrder, DestinationID)
            VALUES (@TourID, @StepOrder, @DestinationID);
          `);
      }

      await tx.commit();
      res.status(201).json({ TourID });
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  } catch (err) { next(err); }
};
