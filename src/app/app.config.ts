export const APP = {
    LIMIT: 16,
    PORT: process.env.PORT || 8000,
    ROOT_PATH: __dirname,
    NAME: 'ACD_RD3 WebTeam API Service',
    URL: '/',
    API_PREFIX: process.env.API_PREFIX || 'api/v1',
    ENVIRONMENT: process.env.NODE_ENV,
    encrypyKey:'Arksdk3.ArkKey',
    APP_ID: '$$',
    APP_SECRET: '$'
};

export const LOGGER = {
    DEFAULT_LOG_LEVEL: 'DEBUG',
    SYS_LOG_LEVEL: 'DEBUG',
    REQ_LOG_LEVEL: null,
    RESP_LOG_LEVEL: 'DEBUG',
    ERROR_LOG_LEVEL: null,
};

export const REDIS = {
    default: {
        //host: process.env.REDIS_DEFAULT_HOST || 'redis-19655.c267.us-east-1-4.ec2.cloud.redislabs.com:19655',
        host: process.env.REDIS_DEFAULT_HOST || 'localhost',
        port: process.env.REDIS_DEFAULT_PORT
            ? parseInt(process.env.REDIS_DEFAULT_PORT, 10)
            : 6379, 
        db: process.env.REDIS_DEFAULT_DB
            ? parseInt(process.env.REDIS_DEFAULT_DB, 10)
            : 0,
        customURL: false
    },
};

export const MONGO = {
    default: {
        host: process.env.MONGO_DEFAULT_HOST || 'localhost',
        port: process.env.MONGO_DEFAULT_PORT
            ? parseInt(process.env.MONGO_DEFAULT_PORT, 10)
            : 27017,
        dbName: process.env.MONGO_DEFAULT_DB
            ? process.env.MONGO_DEFAULT_DB
            : 'AnalyzeData',
        customURL: process.env.MONGO_DEFAULT_CUSTOMURL 
            ? (process.env.MONGO_DEFAULT_CUSTOMURL === 'true' ? true : false)
            : false
    },
    log: {
        host: process.env.MONGO_DEFAULT_HOST || 'localhost',
        port: process.env.MONGO_DEFAULT_PORT
            ? parseInt(process.env.MONGO_DEFAULT_PORT, 10)
            : 27017,
        dbName: process.env.MONGO_DEFAULT_DB
            ? process.env.MONGO_DEFAULT_DB
            : 'AnalyzeData_Log',
        customURL:  process.env.MONGO_DEFAULT_CUSTOMURL 
            ? (process.env.MONGO_DEFAULT_CUSTOMURL === 'true' ? true : false)
            : false
    },
    user: {
        host: process.env.MONGO_DEFAULT_HOST || 'localhost',
        port: process.env.MONGO_DEFAULT_PORT
            ? parseInt(process.env.MONGO_DEFAULT_PORT, 10)
            : 27017,
        dbName: process.env.MONGO_DEFAULT_DB
            ? process.env.MONGO_DEFAULT_DB
            : 'AnalyzeUserData',
        customURL:  process.env.MONGO_DEFAULT_CUSTOMURL 
            ? (process.env.MONGO_DEFAULT_CUSTOMURL === 'true' ? true : false)
            : false
    }
};

export const Suspension = {
    selectDays: 3096,
    DB: 'PantherSetting'
};

export const AUTH = {
    HOST: process.env.AUTH_HOST || '192.168.133.164',
    URL: process.env.AUTH_URL || 'http://192.168.133.164:63551/Web_Service/wsVerification.asmx',
    SERVICE_KEY : process.env.AUTH_SERVICE_KEY || '',
    SERVICE_TOKEN : process.env.AUTH_SERVICE_TOKEN || '',
    LOGIN_TOKEN_EXPIRE_TIME : 60 * 60 * 3
};

export const PERMISSION = {
    ENABLE : process.env.PERMISSION_ENABLE || false,
    URL : process.env.PERMISSION_URL || 'http://192.168.133.154:5102'
};