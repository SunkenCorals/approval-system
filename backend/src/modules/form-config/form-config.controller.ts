import { Controller, Get, Param } from '@nestjs/common';
import { FormConfigService } from './form-config.service';

@Controller('form-configs')
export class FormConfigController {
  constructor(private readonly service: FormConfigService) {}

  @Get(':key')
  getSchema(@Param('key') key: string) {
    return this.service.getSchema(key);
  }
}
