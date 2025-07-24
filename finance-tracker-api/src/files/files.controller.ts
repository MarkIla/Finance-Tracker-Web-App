import { Controller, Post, Get, Query, UseGuards, Param } from '@nestjs/common';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Post('presign-upload')
  presignUpload(
    @Query('filename') filename: string,
    @Query('mime') mime: string,
  ) {
    return this.files.presignUpload(filename, mime);
  }

  @Get('presign-download/:key')
  presignDownload(@Param('key') key: string) {
    return this.files.presignDownload(key);
  }
}
