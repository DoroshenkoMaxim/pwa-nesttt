import { Controller, Get, Render, Post, Param, Body } from '@nestjs/common';

@Controller() // Базовый маршрут
export class AppController {
  @Get() // Обрабатывает GET-запросы на корневом маршруте "/"
  @Render('index') // Рендерит views/index.pug
  getHomePage() {
    // Пустое тело метода, так как данные не передаются
  }
}

@Controller('analytic')
export class AnalyticController {
  // GET /analytic/:osid
  @Get(':osid')
  getData(@Param('osid') osid: string) {
    // Возвращаем объект,
    // который ожидает ваш фронтенд (redirect, pushPlacement...).
    return {
      redirect: 'https://example.com',
      pushPlacement: 'afterInstall',
      setting: {
        installing: {
          ranges: {
            step: { min: 15, max: 20 },
            interval: { min: 1500, max: 2000 },
          },
        },
      },
      postLandingPageId: null,
    };
  }

  // POST /analytic/:osid/:event
  @Post(':osid/:event')
  trackEvent(
    @Param('osid') osid: string,
    @Param('event') event: string,
    @Body() body: any
  ) {
    // Вы можете что-то логировать, сохранять в БД, ...
    console.log('Event:', event, 'OSID:', osid, 'Body:', body);
    return { status: 'ok' };
  }
}
