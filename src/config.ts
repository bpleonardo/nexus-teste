export default () => {
  const data = {
    port: parseInt(process.env.PORT || '3000'),
    database: {
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD,
      url: process.env.DB_URL,
    },
    redis: {
      username: process.env.REDIS_USERNAME || 'redis',
      password: process.env.REDIS_PASSWORD,
    },
    jwt: {
      accessTokenExpiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m',
      refreshTokenExpiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d',
      secret: process.env.JWT_SECRET,
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
