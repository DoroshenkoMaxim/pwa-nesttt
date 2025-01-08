import { Controller, Get, Render } from '@nestjs/common';

@Controller() // Базовый маршрут
export class AppController {
  @Get() // Обрабатывает GET-запросы на корневом маршруте "/"
  @Render('index') // Рендерит views/index.pug
  getHomePage() {
    // Пустое тело метода, так как данные не передаются
  }
}