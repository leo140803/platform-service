import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { StoreModule } from './store/store.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { BannerModule } from './banner/banner.module';
import { GoldpriceModule } from './goldprice/goldprice.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FaqModule } from './faq/faq.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    CommonModule,
    StoreModule,
    BannerModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', // URL prefix to access files
    }),
    GoldpriceModule,
    ScheduleModule.forRoot(),
    FaqModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
