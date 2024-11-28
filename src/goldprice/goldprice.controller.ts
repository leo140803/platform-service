import { Controller, Get } from '@nestjs/common';
import { GoldpriceService } from './goldprice.service';
import { WebResponse } from 'src/model/web.model';

@Controller('/api/goldprice')
export class GoldpriceController {
  constructor(private readonly goldPriceService: GoldpriceService) {}

  @Get()
  async doManual(): Promise<any> {
    return await this.goldPriceService.handleCron();
  }

  @Get('/now')
  async findPriceNow(): Promise<WebResponse<any>> {
    return { data: await this.goldPriceService.getNow() };
  }
}
