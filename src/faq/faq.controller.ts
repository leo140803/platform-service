import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { FaqService } from './faq.service';
import { WebResponse } from 'src/model/web.model';
import {
  FaqEditRequest,
  FaqRequestController,
  FaqResponse,
} from 'src/model/faq.model';
import { v4 as uuidv4 } from 'uuid';

@Controller('/api/faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  async findAll(): Promise<WebResponse<FaqResponse[]>> {
    return {
      data: await this.faqService.findAll(),
    };
  }

  @Get('/type/:type')
  async findByType(
    @Param('type') type: string,
  ): Promise<WebResponse<FaqResponse[]>> {
    return {
      data: await this.faqService.findByType(type),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<WebResponse<FaqResponse>> {
    return {
      data: await this.faqService.findOne(id),
    };
  }

  @Post()
  async create(
    @Body() body: FaqRequestController,
  ): Promise<WebResponse<FaqResponse>> {
    const faqId = uuidv4();
    console.log(body);
    const faq = await this.faqService.createFaq({
      faq_id: faqId,
      question: body.question,
      answer: body.answer,
      type: body.type,
    });

    return {
      data: faq,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: FaqEditRequest,
  ): Promise<WebResponse<FaqResponse>> {
    const updateFaq = await this.faqService.update(id, body);
    return {
      data: updateFaq,
    };
  }
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<WebResponse<FaqResponse>> {
    const Faq = await this.faqService.remove(id);
    return {
      data: Faq,
    };
  }
}
