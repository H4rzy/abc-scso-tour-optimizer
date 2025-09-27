const sql = require('mssql');

const config =
{
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server:  process.env.DB_SERVER,
    database: process.env.DB_NAME,
    option:
    {
        encrypt: true, trustServerCertificate: true
    }
};

let pool;

async function getPool()
{
    if(!pool) pool = await sql.connect(config);
    return pool;
}

module.exports = {getPool,sql};