const path = require('path');
const fs = require('fs-extra');
const { getPool, sql } = require('../db');
const engine = require('../services/engineConnector');

const DATA_DIR = path.join(__dirname,
  '../../engine-Csh/SCSO-ABC hybrid/SCSO-ABC hybrid/data');

const TOURDATA_PATH = path.join(DATA_DIR, 'tourdata.json');
const RESULT_PATH = path.join(DATA_DIR, 'result.json');

exports.uploadAndRun = async (req, res, next) => {
  try {
    const data = req.body;

    // 1. Đảm bảo thư mục tồn tại
    await fs.ensureDir(DATA_DIR);
    console.log('Đang ghi data tại:', DATA_DIR);

    // 2. Ghi file tourdata.json
    await fs.writeJson(TOURDATA_PATH, data, { spaces: 2 });
    console.log('Đã ghi tourdata.json tại:', TOURDATA_PATH);

    // 3. Chạy Engine
    await engine.runEngine();

    // 4. Đọc result.json do Engine xuất ra
    const exists = await fs.pathExists(RESULT_PATH);
    if (!exists) {
      return res.status(500).json({ error: 'Không tìm thấy result.json sau khi chạy Engine' });
    }

    const result = await fs.readJson(RESULT_PATH);
    console.log('Kết quả engine:', result);

    // 5. Lưu vào DB nếu cần
    const pool = await getPool();
    const rs = await pool.request()
      .input('TourName', sql.NVarChar, 'Tour via Upload')
      .input('TotalCost', sql.Float, result.bestCost)
      .query(`
        INSERT INTO Tours (TourName, TotalCost)
        VALUES (@TourName,@TotalCost);
        SELECT SCOPE_IDENTITY() AS TourID;
      `);

    const TourID = rs.recordset[0].TourID;

    res.json({
      message: 'Đã chạy Engine và lưu kết quả',
      TourID,
      result
    });

  } catch (err) {
    next(err);
  }
};
