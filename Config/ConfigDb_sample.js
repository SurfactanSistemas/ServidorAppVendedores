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
}

module.exports = config;