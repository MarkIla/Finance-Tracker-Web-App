import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ExpenseModule } from './expense/expense.module';
import { IncomeModule } from './income/income.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './user/user.entity';
import { Expense } from './expense/expense.entity';
import { Income } from './income/income.entity';
import { SummaryModule } from './summary/summary.module';
import { FilesModule } from './files/files.module';
import { HealthController } from './health.controller';


@Module({
  imports: [
   TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          User, 
          Expense, 
          Income],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        logging: false, // Shows SQL queries in console
        ssl: false, 
      }),
    }), 
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UserModule, 
    AuthModule, 
    ExpenseModule, 
    IncomeModule, 
    SummaryModule, 
    FilesModule
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
