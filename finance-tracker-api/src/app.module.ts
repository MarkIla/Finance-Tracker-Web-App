import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';

import { User } from './user/user.entity';
import { Expense } from './expense/expense.entity';
import { Income } from './income/income.entity';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ExpenseModule } from './expense/expense.module';
import { IncomeModule } from './income/income.module';
import { SummaryModule } from './summary/summary.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    /* ───── Config first ───── */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',       // ignored in Render/Docker
    }),

    /* ───── Database ───── */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject:  [ConfigService],
      useFactory: (cfg: ConfigService): TypeOrmModuleOptions => {
        const isProd = cfg.get<string>('NODE_ENV') === 'production';
        const url    = cfg.get<string>('DATABASE_URL');

        /* Base options */
        const options: TypeOrmModuleOptions = {
          type: 'postgres',
          entities: [User, Expense, Income],
          synchronize: !isProd,     // never auto-sync in production
          logging:     false,
          ssl:         isProd ? { rejectUnauthorized: false } : false,
        };

        if (url) {
          /* Supabase / full URI */
          (options as any).url = url;
        } else {
          /* Local parts */
          Object.assign(options, {
            host:     cfg.get<string>('DB_HOST'),
            port:     cfg.get<number>('DB_PORT'),
            username: cfg.get<string>('DB_USERNAME'),
            password: cfg.get<string>('DB_PASSWORD'),
            database: cfg.get<string>('DB_NAME'),
          });
        }

        return options;
      },
    }),

    /* ───── Feature modules ───── */
    UserModule,
    AuthModule,
    ExpenseModule,
    IncomeModule,
    SummaryModule,
    FilesModule,
  ],
  controllers: [AppController, HealthController],
  providers:   [AppService],
})
export class AppModule {}
