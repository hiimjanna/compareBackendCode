
process.env.GOOGLE_APPLICATION_CREDENTIALS = __dirname + '/../../../i17game-2284674c3bc2.json'
console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS)
import { Storage } from '@google-cloud/storage';
import { PassThrough } from 'stream';
import { Parser, DomHandler } from 'htmlparser2'

export class UploadFileToGCS {

    bucketName = 'game-analyzer';

    async listFiles() {
        const storage = new Storage();
        const [files] = await storage.bucket(this.bucketName).getFiles();

        console.log('Files:');
        files.forEach(file => {
            console.log(file.name);
        });
    }

    async uploadByBase64Str(filename: any, base64Str: string) {
        return new Promise((resolve, reject) => {

            let a = base64Str.split(',')
            let contentType = a[0].split(';')[0].replace("data:", "").trim()
            let extensionFileName = contentType.split('/')[1]
            filename += '_' + Math.floor(Date.now() / 1000) + '.' + extensionFileName

            const storage = new Storage();
            let myBucket = storage.bucket(this.bucketName)
            var file = myBucket.file('FeatureImg/' + filename);

            let bufferStream = new PassThrough();
            bufferStream.end(Buffer.from(a[1], 'base64'));

            bufferStream.pipe(file.createWriteStream({
                metadata: {
                    contentType: contentType,
                    metadata: {
                        custom: 'metadata'
                    }
                },
                public: true,
                validation: "md5"
            }))
                .on('error', (err) => {
                    console.log('error: ', err)
                    reject(err)
                })
                .on('finish', () => {
                    // The file upload is complete.
                    console.log(`${filename} uploaded to ${this.bucketName}.`);
                    resolve(filename)
                });
        });
    }

    loadImg(fileNamePrefix: string, content_progress: string): Promise<string> {
        return new Promise((resolve, reject) => {
            let handler = new DomHandler(async (error, dom) => {
                if (error) return reject(error.toString())
                let j = 0
                for (let i of dom) {
                    if (i['children'] && i['children'][0] && i['children'][0].name === 'img') {
                        let imgSrc = i['children'][0]['attribs']['src']
                        if (imgSrc.indexOf('data:image/') !== -1) {
                            let fileName = await this.uploadByBase64Str(fileNamePrefix + j++, imgSrc)
                            let url = 'https://storage.googleapis.com/game-analyzer/FeatureImg/' + fileName
                            content_progress = content_progress.replace(imgSrc, url)
                        }
                    }
                }
                resolve(content_progress)
            })

            const parser = new Parser(handler)
            parser.parseComplete(content_progress)
        })
    }
}