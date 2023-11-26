import * as nodemailer from 'nodemailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;
  
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'yesenia48@ethereal.email',
        pass: '9NGSNj8YKkBHe6tjnh',
      },
    });
  }

  public async sendMail(payload: MailPayload): Promise<void> {
    try {
      const info = await this.transporter.sendMail(payload);
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (e: any) {
      throw new InternalServerErrorException(
        `An error occurred sending email: ${e.message}`,
      );
    }
  }
}

export interface MailPayload {
  to: string,
  subject: string,
  html: string,
}