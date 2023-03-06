import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [    
    HttpModule.register({
    timeout: 360000,
    maxRedirects: 1,
    headers: {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip',
    },
  }),
  DevtoolsModule.register({
    http: process.env.NODE_ENV !== 'production',
  }),
],
  controllers: [AppController],
  providers: [AppService,HttpModule],
})
export class AppModule {}
