import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class FrontendController {
  @Get()
  @Render('index') // index.ejs
  getIndex() {
    return { 
      title: 'BOOK OF GOLD DELUXE', 
      description: 'Sultan Games' 
    };
  }
}