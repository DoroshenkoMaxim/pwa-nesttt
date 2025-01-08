import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Добавляем модуль для раздачи статики
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      // опционально:
      // serveRoot: '/',
      // exclude: ['/api*'],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}