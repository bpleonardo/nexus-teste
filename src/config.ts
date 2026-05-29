export default () => {
  const data = {
    port: parseInt(process.env.PORT || '3000'),
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'postgres',
      schema: process.env.DB_SCHEMA || 'public',
      connectionString: '',
    },
    jwt: {
      secret: process.env.JWT_SECRET,
    },
  };

  if (!data.database.password) {
    throw new Error('Database password is not set in environment variables.');
  }

  if (!data.jwt.secret) {
    throw new Error('JWT secret is not set in environment variables.');
  }

  data.database.connectionString = `postgresql://${data.database.username}:${data.database.password}@${data.database.host}:${data.database.port}/${data.database.database}?schema=${data.database.schema}`;

  return data;
};
