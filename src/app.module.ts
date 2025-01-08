import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
})
export class AppModule { }