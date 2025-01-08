import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get('*') // Перехватывает все GET-запросы
  sendIndex(@Res() res: Response) {
    res.sendFile('index.html', { root: 'public' });
  }
}