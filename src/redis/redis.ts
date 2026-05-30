import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

export const redisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: async (configService: ConfigService) => {
    return await createClient({
      username: configService.get<string>('redis.username'),
      password: configService.get<string>('redis.password'),
    }).connect();
  },
  inject: [ConfigService],
};
