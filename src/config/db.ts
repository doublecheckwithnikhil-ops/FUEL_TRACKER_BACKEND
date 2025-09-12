import sql from "mssql";
import dotenv from 'dotenv';
dotenv.config();

const dbConfig: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST!,
  database: process.env.DB_NAME,
  options: {
    trustServerCertificate: true,
    instanceName: process.env.DB_INSTANCE, 
  },
};

export const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log("✅ Connected to SQL Server");
    return pool;
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err);
    throw err;
  });
