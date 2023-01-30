/**
 * 作者：王性驊 danielwang
 * 日期：2019-06-19
 * 檔案：格式化錯誤回應
 * 功能：Http 串接回應格式化
 * 本程式使用 帕斯卡命名法
 *  單字之間不以空格斷開或連線號（-）、下劃線（_）連結，第一個單字首字母採用大寫字母；後續單字的首字母亦用大寫字母
 */
import { HttpStatus } from '@nestjs/common';

// 回應狀態
export enum EHttpStatus {
    Error = 'error',
    Success = 'success',
}

export type TMessage = string;
export type TExceptionOption =
    | TMessage
    | {
          message: TMessage;
          error?: any;
      };
export type TExceptionOptionStatus =
    | TMessage
    | {
          code: any;
          message: TMessage;
          error?: any;
      };

// HTTP 狀態
export interface IHttpResponseBase {
    status: HttpStatus;
    message: TMessage;
}

// HTTP error
export type THttpErrorResponse = IHttpResponseBase & {
    error: any;
    debug?: string;
};
