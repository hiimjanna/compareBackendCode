import { INestApplication } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as rateLimit from 'express-rate-limit';
import * as cors from 'cors';
import { getLogger, connectLogger } from 'log4js';
import { LoggerService } from './logger/Logger.service';
import { APP } from '../app/app.config';

export function AppSetup(app: INestApplication) {
    // 使用自己的 Log 系統
    app.useLogger(app.get(LoggerService));
    // 紀錄 access Log
    app.use(
        connectLogger(getLogger('request'), {
            level: 'auto',
            statusRules: [{ codes: [303, 304], level: 'info' }],
        }),
    );
    // 允許跨網域存取
    app.use(
        cors({
            origin: process.env.API_CORS || '*',
        }),
    );
    // 增加 express 使用元素
    // app.use(helmet());
    // app.use(compression());
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    app.use(rateLimit({ max: 1000, windowMs: 15 * 60 * 1000 }));
    app.setGlobalPrefix(APP.API_PREFIX);
}
