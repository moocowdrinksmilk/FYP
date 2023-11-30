import { PutObjectCommand, PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";

export class R2Service {
    private access_key_id = process.env.R2_S3_ACCESS_KEY_ID!;
    private access_key_secret = process.env.R2_S3_SECRET_ACCESS_KEY!;

    private s3 = new S3Client({
        region: "auto",
        endpoint: `https://937f8ffb9ee18fa032deba8e0a582793.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: `${this.access_key_id}`,
            secretAccessKey: `${this.access_key_secret}`,
        },
    });

    public putObjectWithContentType = async (
        bucket: string,
        key: string,
        body: any,
        contentType: string,
    ) => {
        try {
            const params: PutObjectCommandInput = {
                Bucket: bucket,
                Key: `${key}`,
                Body: body,
                ContentType: contentType,
            };
            const command = new PutObjectCommand(params);
            const data = await this.s3.send(command);
            return data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
