export class UserConfig {

  public static codeExpiration = Number(process.env.CODE_EXPIRATION || 3600) * 1000;

  public static requestExpiration = Number(process.env.REQUEST_EXPIRATION || 86400) * 1000;
}