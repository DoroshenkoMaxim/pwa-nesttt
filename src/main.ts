import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Указываем папку для шаблонов Pug
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  // Указываем Pug в качестве шаблонного движка
  app.setViewEngine('pug');

  // Указываем папку для статических файлов
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(3000);
}
bootstrap();