import { Body, Controller, HttpException, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Post_Type } from './app.entities';
import { AppService } from './app.service';
@ApiTags('Crowler Konsi')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }
  @Post()
  @ApiBody({ type: Post_Type })
  async startCrowler(@Body() data: any, @Res() res: Response) {
    try {
      let resp = await this.appService.startCrowler(data)
      return res.status(HttpStatus.OK).send((resp));
    } catch (error) {
      throw new HttpException(
        { message: error.response.message, status: error.status },
        error.status,
      );
    }
  }
  @Post("/screenshot")
  @ApiBody({ type: Post_Type,description:"Gerar Screenshot .png apenas de um cpf" })
  async startCrowlerScreenshot(@Body() data: any, @Res() res: Response) {
    try {
      let newData = {
        ...data,
        screenshot:true
      }
      let resp = await this.appService.startCrowler(newData)
      return res.status(HttpStatus.OK).send((resp));
    } catch (error) {
      throw new HttpException(
        { message: error.response.message, status: error.status },
        error.status,
      );
    }
  }
}
