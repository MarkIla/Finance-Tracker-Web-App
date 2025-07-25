import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
   app.enableCors({
    origin: ['http://localhost:3001'], // Next dev server
    credentials: true,                // allow cookies if you use them
  });
  await app.listen(3000);
}
bootstrap();
