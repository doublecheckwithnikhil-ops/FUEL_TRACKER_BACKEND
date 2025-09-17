"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = (err, req, res, next) => {
    console.error(err); // log for dev
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
};
//# sourceMappingURL=errorHandler.js.map