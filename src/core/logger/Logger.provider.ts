/**
 * 作者：王性驊 danielwang
 * 日期：2019-06-01
 * 檔案：Logger Provider
 * 功能：Log4 JS 封裝
 * 本程式使用 帕斯卡命名法
 *  單字之間不以空格斷開或連線號（-）、下劃線（_）連結，第一個單字首字母採用大寫字母；後續單字的首字母亦用大寫字母
 */

import { loggerConfig } from '../constants/Logger.config';
import {
    LOG4JS_PROVIDER,
    // LOG4JS_CONFIG,
    LOG4JS_REQUEST_LOGGER,
    LOG4JS_RESPONSE_LOGGER,
    LOG4JS_ERROR_LOGGER,
    LOG4JS_SYSTEM_LOGGER,
} from '../constants/system.constant';

import { configure, Log4js, Logger } from 'log4js';

export const LoggerFactory = [
    {
        provide: LOG4JS_PROVIDER,
        useFactory: (): Log4js => {
            return configure(loggerConfig);
        },
    },
    {
        provide: LOG4JS_SYSTEM_LOGGER,
        useFactory: (log4js: Log4js): Logger => {
            return log4js.getLogger('logger');
        },
        inject: [LOG4JS_PROVIDER],
    },
    {
        provide: LOG4JS_REQUEST_LOGGER,
        useFactory: (log4js: Log4js): Logger => {
            return log4js.getLogger('request');
        },
        inject: [LOG4JS_PROVIDER],
    },
    {
        provide: LOG4JS_RESPONSE_LOGGER,
        useFactory: (log4js: Log4js): Logger => {
            return log4js.getLogger('response');
        },
        inject: [LOG4JS_PROVIDER],
    },
    {
        provide: LOG4JS_ERROR_LOGGER,
        useFactory: (log4js: Log4js): Logger => {
            return log4js.getLogger('error');
        },
        inject: [LOG4JS_PROVIDER],
    },
];
