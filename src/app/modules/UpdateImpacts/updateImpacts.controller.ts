import {
    Controller,
    Post,
    Get,
    Body,
    HttpCode,
    Headers,
    Logger,
    Inject,
    Req
} from '@nestjs/common';
import { ApiBody} from '@nestjs/swagger/dist/decorators/api-body.decorator';
import { ApiOkResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { UpdateImpactsService } from './updateImpacts.service'
import { UploadFileToGCS } from '../../../core/util/UploadFileToGCS';
import { GetFeatureContentReqDTO, GetFeatureContentRespDTO } from './dto/getFeatureContent';
import { GetUpdateImpactsListReqDTO, GetUpdateImpactsListRespDTO } from './dto/getUpdateImpactsList';
import { CreateFeatureReqDTO, CreateFeatureRespDTO, EditFeatureReqDTO, } from './dto/createFeature';
import { GetFeatureTagListReqDTO, GetFeatureTagListRespDTO } from './dto/getFeatureTagList';
import { RemoveFeatureTagReqDTO, RemoveFeatureTagRespDTO } from './dto/removeFeatureTag';
import { RemoveFeatureReqDTO, RemoveFeatureRespDTO } from './dto/removeFeature';
import { GetGameNameListRespDTO, GetGameNameListReq } from './dto/getGameNameList';
import { LOG4JS_SYSTEM_LOGGER } from '../../../core/constants/system.constant';
import { GetSimpleFeatureContentReqDTO, GetSimpleFeatureContentRespDTO } from './dto/getSimpleFeatureContent';
import { GetFeatureEditHistoryReq, GetFeatureEditHistoryRes } from './dto/getFeatureEditHistory';
import { GetSpecificVerFeatureContentReq, GetSpecificVerFeatureContentRes } from './dto/getSpecificVerFeatureContent';
import { RevertFeatureContentReq, RevertFeatureContentRes } from './dto/revertFeatureContent';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

@Controller('updateImpacts')
@ApiTags('UpdateImpacts - 更新影響力')

export class UpdateImpactsController {
    controllerName = 'updateImpacts'

    constructor(private readonly updateImpactsService: UpdateImpactsService,
        @Inject(LOG4JS_SYSTEM_LOGGER) private readonly logger: Logger) {
    }

    @Post()
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '取得更新影響力清單',
        type: GetUpdateImpactsListRespDTO
    })
    @ApiBody({
        description: '查詢參數',
        type: GetUpdateImpactsListReqDTO,
        required: false
    })
    async getUpdateImpactsList(@Headers() headers, @Body() body: GetUpdateImpactsListReqDTO) {   //, @Request() res
        this.AccessLog(0, 'getUpdateImpactsList', body)
        let fieldName = 'difference_' + body.country + '_' + body.days;
        let result = await this.updateImpactsService.queryUpdateInfluence(body, fieldName);
        
        let resp: GetUpdateImpactsListRespDTO = await this.updateImpactsService.formatUpdateInfluence(result, fieldName)
        this.AccessLog(1, 'getUpdateImpactsList', resp)
        return resp
    }

    @Post('CreateFeature')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '新增功能改變',
        type: CreateFeatureRespDTO
    })
    @ApiBody({
        description: '查詢參數',
        type: CreateFeatureReqDTO,
        required: false
    })
    async InsertFeature(@Headers() headers, @Body() body: CreateFeatureReqDTO, @Req() req) {
        let uploader = new UploadFileToGCS()

        if (body.newTag !== undefined) {
            for (let i of body.newTag) {
                try {
                    await this.updateImpactsService.insertFeatureTags(i)
                } catch (error) {
                    // console.log('error: ', error)
                }
            }
        }

        let prefix = `${body.appId}_${body.version}_${body.featureName}`
        body.contentProgress = await uploader.loadImg(`${prefix}_Progress_`, body.contentProgress)
        body.contentFeature = await uploader.loadImg(`${prefix}_Feature_`, body.contentFeature)
        let dt = new Date();
        body['editor'] = req['i17_account'].split('@')[0];
        body['createTime'] = dt;
        body['editVersion'] = 0;
        let resp = new CreateFeatureRespDTO();
        try {
            await this.updateImpactsService.insertFeatureContent(body);
            body['Id'] = body['_id'].toString();
            await this.updateImpactsService.createFeatureContentChangeRecord(body);
            resp.Status = 0
        } catch (error) {
            if (error.code === 11000)
                resp.Status = 1
            else
                resp.Status = -1
        }
        this.updateImpactsService.createFeatureUseLogToDB(req.i17Account, body.appId, body.version, body.featureName, 
          body['editVersion'], req.originalUrl, body['Id']);
        return resp
    }

    @Post('EditFeature')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '修改功能改變',
        type: CreateFeatureRespDTO
    })
    @ApiBody({
        description: '查詢參數',
        type: EditFeatureReqDTO,
        required: false
    })
    async EditFeature(@Headers() headers, @Body() body: EditFeatureReqDTO, @Req() req) {
        let uploader = new UploadFileToGCS()

        if (body.newTag !== undefined) {
            for (let i of body.newTag) {
                try {
                    await this.updateImpactsService.insertFeatureTags(i)
                } catch (error) {
                    // console.log('error: ', error)
                }
            }
        }

        let prefix = `${body.appId}_${body.version}_${body.featureName}`
        body.contentProgress = await uploader.loadImg(`${prefix}_Progress_`, body.contentProgress)
        body.contentFeature = await uploader.loadImg(`${prefix}_Feature_`, body.contentFeature)
        let dt = new Date();
        body['editor'] = req['i17_account'].split('@')[0];
        body['createTime'] = dt;
        let resp = new CreateFeatureRespDTO();
        try {
            let updateResult = await this.updateImpactsService.updateFeatureContent(body);
            body['editVersion'] = updateResult['value']['editVersion'] + 1;
            await this.updateImpactsService.createFeatureContentChangeRecord(body);
            // console.log('updateResult: ', updateResult)
            resp.Status = 0
        } catch (error) {
            if (error.code === 11000)
                resp.Status = 1
            else {
                console.log('error: ', error)
                resp.Status = -1
            }
        }
        this.updateImpactsService.createFeatureUseLogToDB(req.i17Account, body.appId, body.version, body.featureName, 
          body['editVersion'], req.originalUrl, body.Id);
        return resp
    }

    @Post('RemoveFeature')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '刪除功能描述',
        type: RemoveFeatureRespDTO
    })
    @ApiBody({
        description: '查詢參數',
        type: RemoveFeatureReqDTO,
        required: false
    })
    async RemoveFeature(@Headers() headers, @Body() body: RemoveFeatureReqDTO) {
        let result = await this.updateImpactsService.removeFeature(body)
        let resp = new RemoveFeatureRespDTO()
        resp.Status = 0
        let updeteCount = result.result.n
        if (updeteCount === 0)
            result.Status = 1
        return resp
    }

    @Post('getFeatureContent')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '查詢功能改變內容',
        type: GetFeatureContentRespDTO
    })
    @ApiBody({
        description: '查詢參數',
        type: GetFeatureContentReqDTO,
        required: false
    })
    async GetFeatureContent(@Headers() headers, @Body() body: GetFeatureContentReqDTO, @Req() req) {
        // console.log('body: ', body)
        let account: string = req.i17Account;
        let resp: GetFeatureContentRespDTO = await this.updateImpactsService.getFeatureContent(body);
        this.updateImpactsService.createFeatureUseLogToDB(account, body.appId, body.version, body.featureName, 
          resp.editVersion, req.originalUrl, resp['_id'].toString());
        resp['_id'] = undefined;
        return resp;
    }

    @Post('GetFeatureTagList')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '取得功能改變 Tag 清單',
        type: GetFeatureTagListRespDTO
    })
    @ApiBody({
        description: '查詢參數',
        type: GetFeatureTagListReqDTO,
        required: false
    })
    async GetFeatureTagList(@Headers() headers, @Body() body: GetFeatureTagListReqDTO) {
        let resp = new GetFeatureTagListRespDTO()
        resp.tags = await this.updateImpactsService.getFeatureTags(body.tagName)
        return resp
    }

    @Post('RemoveFeatureTag')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '刪除功能改變 Tag',
        type: RemoveFeatureTagRespDTO
    })
    @ApiBody({
        description: '查詢參數',
        type: RemoveFeatureTagReqDTO,
        required: false
    })
    async RemoveFeatureTag(@Headers() headers, @Body() body: GetFeatureTagListReqDTO) {
        let result = new RemoveFeatureTagRespDTO()
        result.Status = 0
        let removeResult = await this.updateImpactsService.removeFeatureTag(body.tagName)
        let updeteCount = removeResult.result.n
        if (updeteCount === 0)
            result.Status = 1
        return result
    }


    @Post('GetSimpleFeatureContent')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '查詢預設功能改變',
        type: RemoveFeatureTagRespDTO
    })
    @ApiBody({
        description: '查詢參數',
        type: GetSimpleFeatureContentReqDTO,
        required: false
    })
    async GetSimpleFeatureContent(@Headers() headers, @Body() body: GetSimpleFeatureContentReqDTO) {
        let resp = new GetSimpleFeatureContentRespDTO()
        let result = await this.updateImpactsService.getSimpleFeatureContent(body.featureName)
        if (result != undefined)
            resp.content = result['Explain']
        else
            resp.content = '查無資料'
        return resp
    }

    @Post('GetGameNameList')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '遊戲名稱清單',
        type: GetGameNameListRespDTO
    })
    @ApiBody({
      description: '查詢參數',
      type: GetGameNameListReq,
      required: false
    })
    async GetGameList(@Body() body: GetGameNameListReq) {
        let resp = new GetGameNameListRespDTO();
        resp.game_list = await this.updateImpactsService.getGameNameList(body);
        return resp;
    }

    @Post('GetFeatureEditHistory')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '補充資料編輯歷程',
        type: GetFeatureEditHistoryRes
    })
    @ApiBody({
        description: '查詢參數',
        type: GetFeatureEditHistoryReq,
        required: false
    })
    async GetFeatureEditHistory(@Body() body: GetFeatureEditHistoryReq) {
        let funcPath = `[updateImpacts.controller.GetFeatureEditHistory]`;
        let resp = new GetFeatureEditHistoryRes();
        let result = {};
        try {
            result = await this.updateImpactsService.getFeatureEditHistoryFromDB(body);
        } catch (err) {
            let errMsg = `Get Exception When Find Feature Edit History`;
            this.logger.error(`${funcPath} ${errMsg}, Body: ${JSON.stringify(body)}, ` +
                `Err: ${err.message}`);
            resp.status = 80;
            resp.message = errMsg;
            return resp;
        }
        if (!result) {
            resp.status = 81;
            resp.message = 'DB Response Invalid Data';
            return resp;
        }
        if (Object.getOwnPropertyNames(result).length === 0) {
            resp.status = 82;
            resp.message = `Can't Find Any Data From DB`;
            return resp;
        }
        resp.status = 0;
        resp.message = 'Success';
        resp.editHistory = result;
        return resp;
    }

    @Post('GetSpecificVerFeatureContent')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '特定版本的補充資料',
        type: GetSpecificVerFeatureContentRes
    })
    @ApiBody({
        description: '查詢參數',
        type: GetSpecificVerFeatureContentReq,
        required: false
    })
    async GetSpecificVerFeatureContent(@Body() body: GetSpecificVerFeatureContentReq) {
        let resp = new GetSpecificVerFeatureContentRes();
        let result = await this.updateImpactsService.getSpecificVerFeatureContentFromDB(body);
        if (result) {
            resp.status = 0;
            resp.message = 'Success';
            result.createTime = Math.floor(new Date(result.createTime).getTime() / 1000);
            resp.featureContent = result;
        } else {
            resp.status = 82;
            resp.message = `Can't Find The Data`;
        }
        return resp;
    }

    @Post('RevertFeatureContent')
    @HttpCode(200)
    @ApiHeader({ name: 'token', description: 'Auth Token' })
    @ApiOkResponse({
        description: '復原結果',
        type: RevertFeatureContentRes
    })
    @ApiBody({
        description: '查詢參數',
        type: RevertFeatureContentReq
    })
    async RevertFeatureContent(@Body() body: RevertFeatureContentReq, @Req() req) {
        let funcPath = `[updateImpacts.controller.RevertFeatureContent]`;
        let resp = new RevertFeatureContentRes();
        if (!body || Object.getOwnPropertyNames(body).length === 0) {
            resp.status = 2;
            resp.message = `Wrong Parameter`;
            return resp;
        }
        try {
            //! 取得 FeatureContentChangeHistory 內所保存的資料
            let featureContent = await this.updateImpactsService.getSpecificVerFeatureContentFromDB(body);
            if (!featureContent) {
                resp.status = 82;
                resp.message = `Can't Find The Feature Content`;
                return resp;
            }
            //! 復原 FeatureContent 的資料
            let editor = req['i17_account'].split('@')[0];
            let revertRes = await this.updateImpactsService.revertFeatureContentByHistoryVer(featureContent, editor);
            if (!revertRes['value']) {
                this.logger.error(`${funcPath} Revert Feature Fail, Revert Res: ${JSON.stringify(revertRes)}`);
                resp.status = 82;
                resp.message = `Revert Fail`;
                return resp;
            }
            //! 建立新版本至 FeatureContentChangeHistory
            featureContent.editVersion = revertRes['value']['editVersion'] + 1;
            await this.updateImpactsService.createFeatureContentChangeRecord(featureContent);
            resp.status = 0;
            resp.message = `Success`;
            return resp;
        } catch (err) {
            this.logger.error(`${funcPath} Occur Exception, Err: ${err['message']}`);
            resp.status = 99;
            resp.message = `Occur Exception`;
            return resp;
        }
    }

    AccessLog(isResp: number, apiName: string, msg: object) {
        let type = isResp ? 'res' : 'req'
        this.logger.log('', `[${this.controllerName}][${apiName}][${type}] ${JSON.stringify(msg)}`)
    }
}
