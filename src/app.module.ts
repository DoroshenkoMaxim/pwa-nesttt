import { Module } from '@nestjs/common';
import { AppController } from './frontend.controller';
import { AnalyticController } from './frontend.controller';

@Module({
  imports: [], // Сюда добавляются модули
  controllers: [AppController, AnalyticController], // Регистрируем AppController
  providers: [], // Сюда добавляются сервисы
})
export class AppModule { }