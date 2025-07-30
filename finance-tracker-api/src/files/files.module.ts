import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { ConfigService } from '@nestjs/config';

@Module({ // For Receipt Storage
  providers: [FilesService],
  controllers: [FilesController],
  exports: [FilesService, ConfigService],
})
export class FilesModule {}
