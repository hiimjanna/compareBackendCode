/**
 * 作者：王性驊 danielwang
 * 日期：2019-06-01
 * 檔案：Logger config
 * 功能：Log4 JS 封裝
 * 本程式使用 帕斯卡命名法
 *  單字之間不以空格斷開或連線號（-）、下劃線（_）連結，第一個單字首字母採用大寫字母；後續單字的首字母亦用大寫字母
 */

import * as Path from 'path';
import { Configuration } from 'log4js';
import { LOGGER } from '../../app/app.config';

// 設定一些基礎的 Logger 設定
const path = Path.join(__dirname, '../../../logs/server');
const path_req = path + '/access/request';
const path_resp = path + '/access/response';
const path_error = path + '/error/error';
const path_system = path + '/system/system';

const layout = {
    type: 'colored',
    // pattern: '[%p] %d{yyyy/MM/dd hh:mm:ss} -> %m',
};

// Logger 實際上的 Config
export const loggerConfig: Configuration = {
    appenders: {
        logger: {
            type: 'dateFile',
            filename: path_system,
            pattern: '_yyyy-MM-dd.log',
            compress: 'true',
            alwaysIncludePattern: 'true',
        },
        request: {
            type: 'dateFile',
            filename: path_req,
            pattern: '_yyyy-MM-dd.log',
            compress: 'true',
            alwaysIncludePattern: 'true',
        },
        response: {
            type: 'dateFile',
            filename: path_resp,
            pattern: '_yyyy-MM-dd.log',
            compress: 'true',
            alwaysIncludePattern: 'true',
        },
        error: {
            type: 'dateFile',
            filename: path_error,
            pattern: '_yyyy-MM-dd.log',
            compress: 'true',
            alwaysIncludePattern: 'true',
        },
        console: {
            type: 'console',
            layout,
        },
    },
    categories: {
        default: {
            appenders: ['logger', 'console'],
            level: LOGGER.DEFAULT_LOG_LEVEL || 'INFO',
        },
        logger: {
            appenders: ['logger', 'console'],
            level: LOGGER.SYS_LOG_LEVEL || 'INFO',
        },
        request: {
            appenders: ['request', 'console'],
            level: LOGGER.REQ_LOG_LEVEL || 'INFO',
        },
        response: {
            appenders: ['response', 'console'],
            level: LOGGER.RESP_LOG_LEVEL || 'INFO',
        },
        error: {
            appenders: ['error', 'console'],
            level: LOGGER.ERROR_LOG_LEVEL || 'WARN',
        },
    },
};
