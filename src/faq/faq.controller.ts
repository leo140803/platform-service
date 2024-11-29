import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FaqService } from './faq.service';
import { WebResponse } from 'src/model/web.model';
import {
  FaqEditRequest,
  FaqRequestController,
  FaqResponse,
} from 'src/model/faq.model';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('/api/faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  async findAll(): Promise<WebResponse<FaqResponse[]>> {
    const faqs = await this.faqService.findAll();
    return { data: faqs };
  }

  @Get('/type/:type')
  async findByType(
    @Param('type') type: string,
  ): Promise<WebResponse<FaqResponse[]>> {
    const faqs = await this.faqService.findByType(type);
    return { data: faqs };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<WebResponse<FaqResponse>> {
    const faq = await this.faqService.findOne(id);
    return { data: faq };
  }

  @Post()
  async create(
    @Body() body: FaqRequestController,
  ): Promise<WebResponse<FaqResponse>> {
    const faqId = uuidv4();
    const faq = await this.faqService.createFaq({
      faq_id: faqId,
      question: body.question,
      answer: body.answer,
      type: body.type,
    });
    return { data: faq };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: FaqEditRequest,
  ): Promise<WebResponse<FaqResponse>> {
    const updatedFaq = await this.faqService.update(id, body);
    return { data: updatedFaq };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<WebResponse<FaqResponse>> {
    const deletedFaq = await this.faqService.remove(id);
    return { data: deletedFaq };
  }
}
