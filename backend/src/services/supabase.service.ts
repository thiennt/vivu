import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '../config/database.config';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const config = getSupabaseConfig(this.configService);
    if (!config.url || !config.key) {
      throw new Error('Supabase URL and Key are required');
    }
    this.supabase = createClient(config.url, config.key);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Helper method for file uploads (if needed for game assets)
  async uploadFile(
    bucket: string,
    path: string,
    file: Buffer | File,
  ): Promise<any> {
    return this.supabase.storage.from(bucket).upload(path, file);
  }

  // Helper method for getting public URL
  getPublicUrl(bucket: string, path: string): string {
    return this.supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }
}
