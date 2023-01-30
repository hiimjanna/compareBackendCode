import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app/app.module';
import { INestApplication } from '@nestjs/common';
import { AppSetup } from '../core/appSetup';

describe('SampleController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        AppSetup(app);
        await app.init();
    });

    it('/Search (GET)', () => {
        const respBody = JSON.stringify([
            { _id: 12345, text: 'find()' },
            { _id: 12345, text: 'find()' },
            { _id: 12345, text: 'find()' },
        ]);
        return request(app.getHttpServer())
            .get('/Search')
            .expect(200)
            .expect(respBody);
    });
});
