import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { AuthConfig } from '../auth.config';
import { SocialUser } from './auth.service';

@Injectable()
export class GoogleAuthService {
  async getUser(accessToken: string): Promise<SocialUser> {
    const client = new google.auth.OAuth2(
      AuthConfig.google.appId,
      AuthConfig.google.appSecret,
    );

    client.setCredentials({ access_token: accessToken });

    const oauth2 = google.oauth2({
      auth: client,
      version: 'v2',
    });

    const { data } = await oauth2.userinfo.get();

    return data as SocialUser;
  }
}
