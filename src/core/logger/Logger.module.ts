/**
 * 作者：王性驊 danielwang
 * 日期：2019-06-01
 * 檔案：Logger Module
 * 功能：Log4 JS 封裝
 * 本程式使用 帕斯卡命名法
 *  單字之間不以空格斷開或連線號（-）、下劃線（_）連結，第一個單字首字母採用大寫字母；後續單字的首字母亦用大寫字母
 */
import { Global, Module } from '@nestjs/common';
import { LoggerFactory } from './Logger.provider';
import { LoggerService } from './Logger.service';
@Global()
@Module({
    providers: [...LoggerFactory, LoggerService],
    exports: [...LoggerFactory, LoggerService],
})
export class LoggerModule {}
