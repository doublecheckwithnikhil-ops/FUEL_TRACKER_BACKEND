"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.poolPromise = void 0;
const mssql_1 = __importDefault(require("mssql"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    options: {
        trustServerCertificate: true,
        instanceName: process.env.DB_INSTANCE,
    },
};
exports.poolPromise = new mssql_1.default.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
    console.log("✅ Connected to SQL Server");
    return pool;
})
    .catch(err => {
    console.error("❌ Database connection failed:", err);
    throw err;
});
//# sourceMappingURL=db.js.map