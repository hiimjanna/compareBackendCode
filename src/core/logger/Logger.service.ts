/**
 * 作者：王性驊 danielwang
 * 日期：2019-06-01
 * 檔案：Logger Module
 * 功能：Log4 JS 封裝,並且可以使用 bot 傳送資訊
 * 本程式使用 帕斯卡命名法
 *  單字之間不以空格斷開或連線號（-）、下劃線（_）連結，第一個單字首字母採用大寫字母；後續單字的首字母亦用大寫字母
 */

import { Logger, Injectable, Inject } from '@nestjs/common';
import { LOG4JS_PROVIDER } from '../constants/system.constant';
import { Log4js } from 'log4js';

@Injectable()
export class LoggerService extends Logger {
    constructor(@Inject(LOG4JS_PROVIDER) private log4js: Log4js) {
        super();
    }

    log(message: string, context: string) {
        const resLogger = this.log4js.getLogger('logger');
        resLogger.info(message, context);
    }

    error(message: string, trace: string, context: string) {
        const errLogger = this.log4js.getLogger('error');
        errLogger.error(message, trace, context);
        // const push_Message = `[${message}]: ${context} : ${trace}`;
    }

    warn(message: string, context: string) {
        const errLogger = this.log4js.getLogger('error');
        errLogger.warn(message, context);
        // const push_Message = `[${message}]: ${context}`;
    }
}
