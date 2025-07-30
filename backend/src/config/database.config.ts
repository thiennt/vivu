import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Character, Battle, BattleHistory, Equipment } from '../entities';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [Character, Battle, BattleHistory, Equipment],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
});

export const getSupabaseConfig = (configService: ConfigService) => ({
  url: configService.get<string>('SUPABASE_URL') || '',
  key: configService.get<string>('SUPABASE_KEY') || '',
});
