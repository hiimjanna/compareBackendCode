export const ServiceConstant = {
    board: {
        default: {
            lang: 'zh_Hant',
            platform: 'web',
            timezone: 8,
        },
    },
};
export const environment = process.env.NODE_ENV;
export const isDevMode = Object.is(environment, 'development');
