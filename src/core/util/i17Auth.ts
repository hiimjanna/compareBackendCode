import { AUTH } from '../../app/app.config';
import * as crypto from 'crypto';
import * as xml2js from 'xml2js';
import * as requestretry from 'requestretry';

const I17AUTH_STATUS = {
  'SUCCESS': 0,
  'WRONG_PARAMETER': 2,
  'SEND_REQUEST_FAIL': 11,
  'PARSE_XML_FAIL': 21,
  'DECRYPT_FAIL': 22
}

export class I17Auth {
  private readonly DEF_ALGORITHM = 'aes-256-ecb';
  private readonly CLEAR_ENCODING = 'utf8';
  private readonly CIPHER_ENCODING = 'base64';
  private readonly IV = undefined;

  public async getI17AuthToken(userData: object) {
    //! 產生所需資料
    let encryptText = this.getEncryptData(userData);
    if (!encryptText) {
      return { 'status': 1, 'message': 'Encrypt Fail' };
    }
    let contentData = {
      'AuthData': encryptText,
      'ServiceKey': AUTH.SERVICE_KEY
    };
    //! 發送請求封包
    let type = 'AuthToken';
    let sendRes = await this.sendReqToI17Auth(type, contentData, AUTH.URL)
    if (sendRes['status'] !== 0) {
      return { 'status': sendRes['status'], 'message': sendRes['message'] };
    }
    //! 解析封包
    let resData = await xmlParser(sendRes['result'], type);
    if (resData['status'] !== 0) {
      return { 'status': resData['status'], 'message': resData['message'] };
    }
    let decryptRes = this.getDecryptData(resData['result']);
    if (!decryptRes) {
      return { 'status': 1, 'message': 'Decrypt Fail' };
    }
    return { 'status': 0, 'message': 'success', 'data': decryptRes };
  }

  public async verifyI17AuthToken(userData: object, callback: (verifyRes: Object) => void) {
    //! 產生所需資料
    let encryptText = this.getEncryptData(userData);
    if (!encryptText) {
      callback({ 'status': I17AUTH_STATUS.WRONG_PARAMETER, 'message': 'Encrypt Fail' });
    }
    let contentData = {
      'ServiceKey': AUTH.SERVICE_KEY,
      'VerifyData': encryptText
    };
    //! 發送請求封包
    let type = 'VerifyAuthToken';
    let sendRes = await this.sendReqToI17Auth(type, contentData, AUTH.URL)
    if (sendRes['status'] !== 0) {
      callback({ 'status': I17AUTH_STATUS.SEND_REQUEST_FAIL, 'message': sendRes['message'] });
    }
    //! 解析封包
    let resData = await xmlParser(sendRes['result'], type);
    if (resData['status'] !== 0) {
      callback({ 'status': I17AUTH_STATUS.PARSE_XML_FAIL, 'message': resData['message'] });
    }
    let decryptRes = this.getDecryptData(resData['result']);
    if (!decryptRes) {
      callback({ 'status': I17AUTH_STATUS.DECRYPT_FAIL, 'message': 'Decrypt Fail' });
    }
    callback({ 'status': I17AUTH_STATUS.SUCCESS, 'message': 'success', 'data': decryptRes });
  }

  private async sendReqToI17Auth(type: string, data: object, url: string) {
    let dataStr = Buffer.from(JSON.stringify(data)).toString('base64');
    let reqContent: string = this.getXmlContent(dataStr, type);
    let headers = {
      'Content-Type': 'application/soap+xml; charset=utf-8',
      'Content-Length': reqContent.length,
      'Host': AUTH.HOST
    };
    let postRes = await this.post(url, reqContent, headers);
    if (postRes['status'] !== 0) {
      return { 'status': postRes['status'], 'message': postRes['message'] };
    }
    return { 'status': 0, 'message': 'Success', 'result': postRes['result'] };
  }

  private getEncryptData(dataObj: object) {
    let privateKey = crypto.createHash('md5').update(AUTH.SERVICE_TOKEN).digest('hex');
    let encryptText = this.encrypt(JSON.stringify(dataObj), privateKey, this.IV, this.DEF_ALGORITHM);
    if (!encryptText) {
      return false;
    }
    return encryptText;
  }

  private getDecryptData(dataStr: string) {
    let privateKey = crypto.createHash('md5').update(AUTH.SERVICE_TOKEN).digest('hex');
    let decryptRes = this.decrypt(dataStr, privateKey, this.IV, this.DEF_ALGORITHM);
    if (!decryptRes) {
      return false;
    }
    return JSON.parse(decryptRes);
  }

  private getXmlContent(content: string, type: string) {
    return `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <${type} xmlns="http://tempuri.org/">
          <_Data> ${content} </_Data>
        </${type}>
      </soap12:Body>
    </soap12:Envelope>`
  }

  private encrypt(data: string, key: string, iv: string, algorithm) {
    if (!data) {
      return false;
    }
    iv = iv || '';
    algorithm = algorithm || this.DEF_ALGORITHM;
    let cipherChunks = [];
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    cipher.setAutoPadding(true);
    cipherChunks.push(cipher.update(data, this.CLEAR_ENCODING, this.CIPHER_ENCODING));
    cipherChunks.push(cipher.final(this.CIPHER_ENCODING));
    return cipherChunks.join('');
  }

  private decrypt(data: string, key: string, iv: string, algorithm) {
    if (!data) {
      return false;
    }
    iv = iv || '';
    algorithm = algorithm || this.DEF_ALGORITHM;
    let cipherChunks = [];
    let decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAutoPadding(true);
    cipherChunks.push(decipher.update(data, this.CIPHER_ENCODING, this.CLEAR_ENCODING));
    cipherChunks.push(decipher.final(this.CLEAR_ENCODING));
    return cipherChunks.join('');
  }

  private async post(url: string, data: any, headers: object): Promise<object> {
    let delaySec = 1;
    return new Promise((resolve, reject) => {
      requestretry.post({
        'url': url,
        'headers': headers,
        'body': data,
        'timeout': 10000,
        'maxAttempts': 3,
        'delayStrategy': countDelayTime(delaySec),
        'retryStrategy': this.retryStrategy
      }, (err, response, body) => {
        if (err) {
          return resolve({ 'status': 1, 'message': err['message'] });
        }
        return resolve({ 'status': 0, 'message': 'Success', 'result': body });
      })
    });
  }

  private async retryStrategy(err, response, body) {
    let resData = await xmlParser(body, '');
    if (resData['status'] !== 0 || !resData['result']) {
      console.log(`!!!RETRY REQUEST!!!`);
      return true;
    }
    return !!err;
  }
}

function xmlParser(xmlContent, type: string = ''): Promise<object> {
  return new Promise((resolve, reject) => {
    let options = { explicitArray: false, tagNameProcessors: [xml2js.processors.stripPrefix] };
    xml2js.parseString(xmlContent, options, (err, res) => {
      try {
        if (type === '') {
          type = Object.getOwnPropertyNames(res['Envelope']['Body'])[0].replace('Response', '');
        }
        let result = res['Envelope']['Body'][`${type}Response`][`${type}Result`];
        return resolve({ 'status': 0, 'message': 'Success', 'result': result });
      }
      catch (err) {
        // console.log(`xmlParser Occur Error , Msg: ${err['message']}`);
        return resolve({ 'status': 1, 'message': err['message'] });
      }
    });
  });
}

function countDelayTime(delaySec: number) {
  let attempts: number = 0;
  let delayMilliSec: number = delaySec * 1000;
  return () => {
    attempts += 1;
    return (delayMilliSec * (Math.pow(2, attempts)));
  };
}