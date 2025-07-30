import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  healthy() {
    return { ok: true, ts: Date.now() };
  }
}
