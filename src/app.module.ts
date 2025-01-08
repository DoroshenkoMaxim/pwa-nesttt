import { Module } from '@nestjs/common';
import { AppController } from './frontend.controller';

@Module({
  imports: [], // Сюда добавляются модули
  controllers: [AppController], // Регистрируем AppController
  providers: [], // Сюда добавляются сервисы
})
export class AppModule {}