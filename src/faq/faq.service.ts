import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { Faq } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { FaqEditRequest, FaqRequest, FaqResponse } from 'src/model/faq.model';
import { FaqValidation } from './faq.validation';

@Injectable()
export class FaqService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private logger: Logger,
    private readonly prisma: PrismaService,
    private validationService: ValidationService,
  ) {}

  toFaqResponse(faq: Faq): FaqResponse {
    return {
      faq_id: faq.faq_id,
      question: faq.question,
      answer: faq.answer,
      type: faq.type,
      created_at: faq.created_at,
      updated_at: faq.updated_at,
    };
  }

  async findAll(): Promise<FaqResponse[]> {
    const faqs = await this.prisma.faq.findMany();
    if (faqs.length == 0) {
      this.logger.log('FAQS not found!');
      throw new HttpException('FAQS not found!', 404);
    }
    return faqs.map((faq) => this.toFaqResponse(faq));
  }

  async findOne(faq_id: string): Promise<FaqResponse> {
    const faq = await this.prisma.faq.findUnique({ where: { faq_id } });
    if (!faq) {
      throw new HttpException('FAQ not found!', 404);
    }

    return this.toFaqResponse(faq);
  }
  async findByType(type: string): Promise<FaqResponse[]> {
    const faqs = await this.prisma.faq.findMany({
      where: { type: parseInt(type, 10) },
    });
    if (faqs.length == 0) {
      throw new HttpException('FAQ not found!', 404);
    }

    return faqs.map((faq) => this.toFaqResponse(faq));
  }

  async createFaq(data: FaqRequest): Promise<FaqResponse> {
    const createRequest = this.validationService.validate(
      FaqValidation.CREATE,
      data,
    );

    const faq = await this.prisma.faq.create({
      data: {
        faq_id: data.faq_id,
        question: createRequest.question,
        answer: createRequest.answer,
        type: createRequest.type,
      },
    });

    return this.toFaqResponse(faq);
  }

  async update(faq_id: string, data: FaqEditRequest): Promise<FaqResponse> {
    const faq = await this.findOne(faq_id);
    const updateRequest = await this.validationService.validate(
      FaqValidation.CREATE,
      data,
    );

    const update = await this.prisma.faq.update({
      where: { faq_id },
      data: {
        question: updateRequest.question ?? faq.question,
        answer: updateRequest.answer ?? faq.answer,
        type: updateRequest.type ?? faq.type,
        updated_at: new Date(),
      },
    });

    return this.toFaqResponse(update);
  }

  async remove(faq_id: string): Promise<FaqResponse> {
    await this.findOne(faq_id);
    const deleteFaq = await this.prisma.faq.delete({
      where: {
        faq_id,
      },
    });

    return this.toFaqResponse(deleteFaq);
  }
}
