import { NestFactory } from '@nestjs/core';
import { getLogger } from 'log4js';
import { AppModule } from './app/app.module';
import { AppSetup } from './core/appSetup';
import { APP } from './app/app.config';
import { DocumentBuilder } from '@nestjs/swagger/dist/document-builder';
import { SwaggerModule } from '@nestjs/swagger/dist/swagger-module';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, { logger: false });
    AppSetup(app);

    // 建立Swagger頁面設定檔  
    const userApiOptions = new DocumentBuilder()
        .setTitle('User API Doc')
        .setDescription('User API Info')
        .setVersion('1.0')
        // .addBearerAuth()
        // .addTag('users') // match tags in controllers
        .build();

    // 沒有指定第三個參數代表所有Module的controller都會被偵測
    const userApiDocument = SwaggerModule.createDocument(app, userApiOptions);
    // 指定Swagger API頁面路徑及傳入nest app及頁面設定檔
    SwaggerModule.setup('api-doc/', app, userApiDocument);

    await app.listen(APP.PORT);
}

// tslint:disable-next-line:no-console
bootstrap()
    .then(_ => {
        getLogger('logger').info(
            `${APP.NAME} Run！port at ${APP.PORT}, env: ${APP.ENVIRONMENT}`,
        );
    })
    .catch(err => console.error(err));
