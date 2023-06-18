import { Module } from '@nestjs/common';
import { FifoModule } from './fifo/fifo.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';

@Module({
  imports: [
    FifoModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend', 'build'),
    }),
    ConfigModule.forRoot(),
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
