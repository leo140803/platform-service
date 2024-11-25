import { Injectable, Inject, Logger, HttpException } from '@nestjs/common';
import { Banner } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  BannerRequestService,
  BannerResponse,
  BannerUpdateRequestService,
} from 'src/model/banner.model';
import { BannerValidation } from './banner.validation';
@Injectable()
export class BannerService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private logger: Logger,
    private readonly prisma: PrismaService,
    private validationService: ValidationService,
  ) {}

  toBannerResponse(banner: Banner): BannerResponse {
    return {
      banner_id: banner.banner_id,
      title: banner.title,
      image_url: banner.image_url,
      description: banner.description,
      status: banner.status,
      created_at: banner.created_at,
    };
  }

  async findAll(): Promise<BannerResponse[]> {
    const banners = await this.prisma.banner.findMany();
    if (banners.length == 0) {
      this.logger.log('Banner not found!');
      throw new HttpException('Banner not found!', 404);
    }
    return banners.map((banner) => this.toBannerResponse(banner));
  }

  async findAllActive(): Promise<BannerResponse[]> {
    const banners = await this.prisma.banner.findMany({
      where: { status: true },
    });
    if (banners.length == 0) {
      this.logger.log('Banner not found!');
      throw new HttpException('Banner not found!', 404);
    }
    return banners.map((banner) => this.toBannerResponse(banner));
  }

  async findOne(banner_id: string): Promise<BannerResponse> {
    const banner = await this.prisma.banner.findUnique({
      where: { banner_id },
    });
    if (!banner) {
      this.logger.log('Banner not found!');
      throw new HttpException('Banner not found!', 404);
    }
    return this.toBannerResponse(banner);
  }

  async create(data: BannerRequestService): Promise<BannerResponse> {
    const createRequest = this.validationService.validate(
      BannerValidation.CREATE,
      data,
    );
    const banner = await this.prisma.banner.create({
      data: {
        banner_id: data.banner_id,
        title: createRequest.title,
        description: createRequest.description,
        status: createRequest.status,
        image_url: data.image_url,
      },
    });

    return this.toBannerResponse(banner);
  }

  async update(
    banner_id: string,
    data: BannerUpdateRequestService,
  ): Promise<BannerResponse> {
    const banner = await this.findOne(banner_id);
    const updateRequest = this.validationService.validate(
      BannerValidation.UPDATE,
      data,
    );
    const update = await this.prisma.banner.update({
      where: { banner_id },
      data: {
        title: updateRequest.title ?? banner.title,
        description: updateRequest.description ?? banner.description,
        status: updateRequest.status ?? banner.status,
        image_url: data.image_url ?? banner.image_url,
      },
    });
    return this.toBannerResponse(update);
  }

  async remove(banner_id: string): Promise<BannerResponse> {
    await this.findOne(banner_id);
    const deleteBanner = await this.prisma.banner.delete({
      where: {
        banner_id: banner_id,
      },
    });
    return this.toBannerResponse(deleteBanner);
  }
}
