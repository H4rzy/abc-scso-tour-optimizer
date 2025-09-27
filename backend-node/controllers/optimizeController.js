const { getPool, sql } = require('../db');
const engine = require('../services/engineConnector');

exports.optimizeTour = async (req, res, next) => {
  try {
    // body: { DestinationIDs: [1,2,3,...], Budget?: number }
    const { DestinationIDs = [], Budget = null, TourName = 'Auto Tour' } = req.body;

    // 1) Lấy ma trận chi phí + meta điểm đến từ DB
    const pool = await getPool();
    const destRs = await pool.request().query('SELECT DestinationID, Name FROM Destinations');
    const costRs = await pool.request().query('SELECT FromDestinationID, ToDestinationID, Cost FROM TravelCosts');

    const inputForEngine = {
      Destinations: destRs.recordset.map(d => d.Name),
      DestinationIDs,
      Costs: costRs.recordset, // hoặc bạn build thành ma trận nếu Engine yêu cầu
      Budget
    };

    // 2) Gọi Engine C#
    const result = await engine.optimize(inputForEngine);
    // kỳ vọng Engine trả { routeIds:[...DestinationID...], totalCost:number }

    // 3) Lưu vào DB
    const tx = new sql.Transaction(await getPool());
    await tx.begin();
    try {
      const req1 = new sql.Request(tx);
      const rs = await req1
        .input('TourName', sql.NVarChar, TourName)
        .input('TotalCost', sql.Float, result.totalCost)
        .query(`
          INSERT INTO Tours (TourName, TotalCost) VALUES (@TourName, @TotalCost);
          SELECT SCOPE_IDENTITY() AS TourID;
        `);
      const TourID = rs.recordset[0].TourID;

      for (let i = 0; i < result.routeIds.length; i++) {
        const r = new sql.Request(tx);
        await r
          .input('TourID', sql.Int, TourID)
          .input('StepOrder', sql.Int, i + 1)
          .input('DestinationID', sql.Int, result.routeIds[i])
          .query('INSERT INTO TourSteps (TourID, StepOrder, DestinationID) VALUES (@TourID, @StepOrder, @DestinationID)');
      }
      await tx.commit();

      res.json({ TourID, TotalCost: result.totalCost, Steps: result.routeIds });
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  } catch (err) { next(err); }
};
