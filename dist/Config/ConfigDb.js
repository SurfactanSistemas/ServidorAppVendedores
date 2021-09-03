"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigDb = void 0;
const config = {
    user: '',
    password: '',
    server: '9.9.9.9',
    database: '',
    options: {
        encrypt: false
    },
    pool: {
        max: 10,
        min: 1,
        idleTimeoutMillis: 30000
    }
};
exports.ConfigDb = config;
