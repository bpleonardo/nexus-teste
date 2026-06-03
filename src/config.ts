import ms, { StringValue } from 'ms';

const e = process.env;

export default () => {
  const data = {
    app: {
      port: parseInt(e.PORT || '3000'),
      transactionTax: parseFloat(e.TRANSACTION_TAX || '1.5') / 100,
    },
    database: {
      username: e.DB_USERNAME || 'postgres',
      password: e.DB_PASSWORD,
      url: e.DB_URL,
    },
    redis: {
      url: e.REDIS_URL || 'redis://localhost:6379',
      username: e.REDIS_USERNAME || 'redis',
      password: e.REDIS_PASSWORD,
    },
    jwt: {
      accessTokenExpiration: ms((e.JWT_ACCESS_TOKEN_EXPIRATION as StringValue) || '5m'),
      refreshTokenExpiration: ms((e.JWT_REFRESH_TOKEN_EXPIRATION as StringValue) || '7d'),
      secret: e.JWT_SECRET,
    },
  };

  if (!data.database.password) {
    throw new Error('Database password is not set in environment variables.');
  }

  if (!data.jwt.secret) {
    throw new Error('JWT secret is not set in environment variables.');
  }

  if (!data.database.url) {
    throw new Error('Database URL is not set in environment variables.');
  }

  return data;
};
