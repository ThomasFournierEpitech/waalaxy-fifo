import { Module } from '@nestjs/common';
import { FifoModule } from './fifo/fifo.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    FifoModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend', 'build'),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
