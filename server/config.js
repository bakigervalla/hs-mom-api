const config = {
    dev: 'development',
    test: 'test',
    prod: 'production',
    port: process.env.PORT || 8000,
    expireTime: '7d',
    secrets: {
        jwt: process.env.JWT || 'hssecrets2023',
    }
};

// Setting environment variable
process.env.NODE_ENV = process.env.NODE_ENV || config.dev;
config.env = process.env.NODE_ENV;

module.exports = config;