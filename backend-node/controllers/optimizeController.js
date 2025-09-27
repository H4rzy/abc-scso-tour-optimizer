const path = require('path');
const fs = require('fs-extra');
const csv = require('csv-parser');
const { getPool, sql } = require('../db');
const engine = require('../services/engineConnector');

const DATA_DIR = path.join(__dirname,
  '../../engine-Csh/SCSO-ABC hybrid/SCSO-ABC hybrid/data');

const TOURDATA_PATH = path.join(DATA_DIR, 'tourdata.json');
const BESTHISTORY_PATH = path.join(DATA_DIR, 'BestHistory.csv');

exports.uploadAndRun = async (req, res, next) => {
  try {
    const data = req.body;

    
    await fs.ensureDir(DATA_DIR);
    console.log('Đang ghi data tại:',DATA_DIR);

    await fs.writeJson(TOURDATA_PATH, data, { spaces: 2 });

    console.log('Đang ghi tourdata.json tại:', TOURDATA_PATH);

    await engine.runEngine();

    console.log('Đang ghi BestHistory.csv tại:', BESTHISTORY_PATH);

    const exists = await fs.pathExists(BESTHISTORY_PATH);
    if (!exists) return res.status(500).json({ error: 'Không tìm thấy BestHistory.csv sau khi chạy Engine' });

    const pool = await getPool();
    const rs = await pool.request()
      .input('TourName', sql.NVarChar, 'Tour via Upload')
      .input('TotalCost', sql.Float, 0)
      .query(`
        INSERT INTO Tours (TourName, TotalCost)
        VALUES (@TourName,@TotalCost);
        SELECT SCOPE_IDENTITY() AS TourID;
      `);
    const TourID = rs.recordset[0].TourID;

    const results = [];
    fs.createReadStream(BESTHISTORY_PATH)
      .pipe(csv())
      .on('data', row => results.push(row))
      .on('end', async () => {
        for (const r of results) {
          await pool.request()
            .input('TourID', sql.Int, TourID)
            .input('Iteration', sql.Int, r.Iteration)
            .input('BestCost', sql.Float, r.BestCost)
            .query('INSERT INTO TourHistory (TourID, Iteration, BestCost) VALUES (@TourID,@Iteration,@BestCost)');
        }

        res.json({
          message: 'Đã ghi tourdata.json, chạy Engine xong, insert TourHistory',
          TourID,
          totalRows: results.length
        });
      });

  } catch (err) {
    next(err);
  }
};
