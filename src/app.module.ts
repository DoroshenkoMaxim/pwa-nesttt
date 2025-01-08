import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FrontendController } from './frontend.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Укажите путь к HTML-файлам
    }),
  ],
  controllers: [FrontendController],
})
export class AppModule {}
