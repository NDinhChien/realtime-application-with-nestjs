interface Secret {
  appId: string;
  appSecret: string;
}

export class AuthConfig {

  public static facebook: Secret = {
    appId: process.env.FACEBOOK_APP_ID || '',
    appSecret: process.env.FACEBOOK_APP_SECRET || ''
  }
  
  public static google: Secret = {
    appId: process.env.GOOGLE_APP_ID || '',
    appSecret: process.env.GOOGLE_APP_SECRET || '',
  }
  
  public static accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'accessTokenSecret';
  public static accessTokenExpiration = process.env.ACCESS_TOKEN_EXPIRATION || '24h';
  public static refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'refreshTokenSecret';
  public static refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION || '48h';
}

