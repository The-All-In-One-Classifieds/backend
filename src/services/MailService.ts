import nodemailer from 'nodemailer';
import {MailInterface} from '../@types/MailInterface';

export default class MailService {
    private static instance: MailService;
    private transporter!: nodemailer.Transporter;

    private constructor() {
    }

    //INSTANCE CREATE FOR MAIL
    static getInstance() {
        console.log("checkpoint 1")
        if (!MailService.instance) {
            console.log("checkpoint 2")
            MailService.instance = new MailService();
        }
        return MailService.instance;
    }

    //CREATE CONNECTION FOR LOCAL
    async createLocalConnection() {
        let account = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: {
                user: account.user,
                pass: account.pass,
            },
        });
    }

    //CREATE A CONNECTION FOR LIVE
    async createConnection() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_TLS === 'yes',
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }

    //SEND MAIL
    // async sendMail(
    //     requestId: string | number | string[],
    //     options: MailInterface
    // ) {
    //     return await this.transporter
    //         .sendMail({
    //             from: `BidIT - ${process.env.SMTP_SENDER}`,
    //             to: options.to,
    //             cc: options.cc,
    //             bcc: options.bcc,
    //             subject: options.subject,
    //             text: options.text,
    //             html: options.html,
    //         })
    //         .then((info) => {
    //             console.log(`${requestId} - Mail sent successfully!!`);
    //             console.log(`${requestId} - [MailResponse]=${info.response} [MessageID]=${info.messageId}`);
    //             if (process.env.NODE_ENV === 'local') {
    //                 console.log(`${requestId} - Nodemailer ethereal URL: ${nodemailer.getTestMessageUrl(
    //                     info
    //                 )}`);
    //             }
    //             return info;
    //         });
    // }
    // In MailService

//SEND MAIL
    async sendMail(
        requestId: string | number | string[],
        options: MailInterface
    ): Promise<{ success: boolean; message: string; info?: nodemailer.SentMessageInfo }> {
        try {
            const info = await this.transporter
                .sendMail({
                    from: `"BidIT" ${process.env.SMTP_SENDER}`,
                    to: options.to,
                    cc: options.cc,
                    bcc: options.bcc,
                    subject: options.subject,
                    text: options.text,
                    html: options.html,
                })
                .then((info) => {
                    console.log(`${requestId} - Mail sent successfully!!`);
                    console.log(`${requestId} - [MailResponse]=${info.response} [MessageID]=${info.messageId}`);
                    if (process.env.NODE_ENV === 'local') {
                        console.log(`${requestId} - Nodemailer ethereal URL: ${nodemailer.getTestMessageUrl(
                            info
                        )}`);
                    }
                    return info;
                });
            console.log(`${requestId} - Mail sent successfully!!`);
            console.log(`${requestId} - [MailResponse]=${info.response} [MessageID]=${info.messageId}`);

            if (process.env.NODE_ENV === 'local') {
                console.log(`${requestId} - Nodemailer ethereal URL: ${nodemailer.getTestMessageUrl(info)}`);
            }

            return {success: true, message: 'Mail sent successfully', info};
        } catch (error) {
            console.error(`${requestId} - Failed to send mail: `, error);
            return {success: false, message: 'Failed to send mail', info: error};
        }
    }

    //VERIFY CONNECTION
    async verifyConnection() {
        return this.transporter.verify();
    }

    //CREATE TRANSPORTER
    getTransporter() {
        return this.transporter;
    }
}