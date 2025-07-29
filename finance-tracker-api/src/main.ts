import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create(AppModule, {
    cors: false,
    logger: isProd ? ['error', 'warn', 'log'] : ['debug', 'error', 'warn', 'log', 'verbose'],
  });

  /* ─────────────────── middle-wares ─────────────────── */
  app.use(helmet());
  const cookieParser = require('cookie-parser');
  app.use(cookieParser());

  /* ─────────────────── dynamic CORS ─────────────────── */
  const cfg = app.get(ConfigService);
  const corsList =
    (cfg.get<string>('CORS_ORIGINS') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean); // removes empty strings

  //  Local dev convenience: allow localhost:3000 automatically
  if (!isProd && !corsList.length) corsList.push('http://localhost:3000');

  app.enableCors({
    origin: corsList.length ? corsList : true, // true = allow all (dev, tests)
    credentials: true,
  });

  /* ─────────────────── global pipes ─────────────────── */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /* ─────────────────── start server ─────────────────── */
  const port = Number(process.env.PORT) || 8080;
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(`Environment: ${isProd ? 'production' : 'development'}`);
  logger.log(`CORS origins : ${corsList.length ? corsList.join(', ') : '*'}`);
  logger.log(`API running  : http://localhost:${port}/`);
}
bootstrap();
