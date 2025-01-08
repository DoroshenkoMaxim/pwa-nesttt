import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index') // Рендерит views/index.pug
  getHomePage() {
    return {
      title: 'My App',
      description: 'Welcome to My NestJS App!',
    };
  }
}