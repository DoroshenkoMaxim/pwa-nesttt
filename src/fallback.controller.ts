import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class FallbackController {
  @Get('*')
  fallback(@Res() res: Response) {
    res.sendFile('index.html', { root: join(__dirname, '..', 'public') });
  }
}