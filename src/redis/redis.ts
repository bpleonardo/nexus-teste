import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

import { REDIS_CLIENT } from '@/constants';

export const redisProvider = {
  provide: REDIS_CLIENT,
  useFactory: async (configService: ConfigService) => {
    return await createClient({
      username: configService.get<string>('redis.username'),
      password: configService.get<string>('redis.password'),
    }).connect();
  },
  inject: [ConfigService],
};
