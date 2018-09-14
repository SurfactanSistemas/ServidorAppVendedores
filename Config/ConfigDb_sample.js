const config = {
    user: 'usuarioadmin',
    password: 'usuarioadmin',
    server: '193.168.0.7',
    database: 'SurfactanSa',
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