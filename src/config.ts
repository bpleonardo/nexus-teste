const e = process.env;

export default () => {
  const data = {
    port: parseInt(e.PORT || '3000'),
    database: {
      username: e.DB_USERNAME || 'postgres',
      password: e.DB_PASSWORD,
      url: e.DB_URL,
    },
    redis: {
      username: e.REDIS_USERNAME || 'redis',
      password: e.REDIS_PASSWORD,
    },
    jwt: {
      accessTokenExpiration: e.JWT_ACCESS_TOKEN_EXPIRATION || '5m',
      refreshTokenExpiration: e.JWT_REFRESH_TOKEN_EXPIRATION || '7d',
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
