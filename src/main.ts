import { NestFactory } from '@nestjs/core';
import cookieparser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieparser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
