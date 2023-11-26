export class AppConfig {
  public static port = Number(process.env.PORT || 3000);
  public static proxyEnabled = process.env.PROXY_ENABLED === 'true';
  public static frontEndUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
  public static mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test-db';

  public static redis = {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST || '',
    port: Number(process.env.REDIS_PORT || 0),
  };
};
