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
import * as fs from 'fs';
import { join, extname } from 'path';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BannerService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private logger: Logger,
    private readonly prisma: PrismaService,
    private validationService: ValidationService,
    @Inject('MARKETPLACE_SERVICE') private readonly client: ClientProxy,
  ) {}

  private generateUniqueFileName(originalName: string): string {
    return `banner-${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(originalName)}`;
  }

  private saveImageToDisk(
    image: Express.Multer.File,
    uniqueFileName: string,
  ): string {
    const uploadPath = join(__dirname, '../../uploads/banner', uniqueFileName);
    if (!fs.existsSync(join(__dirname, '../../uploads/banner'))) {
      fs.mkdirSync(join(__dirname, '../../uploads/banner'), {
        recursive: true,
      });
    }
    fs.writeFileSync(uploadPath, image.buffer);
    return `/uploads/banner/${uniqueFileName}`;
  }

  private async handleMicroserviceCommunication(event: string, data: any) {
    try {
      const response = await firstValueFrom(this.client.send(event, data));
      console.log('Microservice response:', response);
    } catch (error) {
      console.error(`Error in microservice: ${error.message}`);
    }
  }

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

  async create(
    data: BannerRequestService,
    image: Express.Multer.File,
  ): Promise<BannerResponse> {
    const bannerId = uuidv4();
    const statusBool = data.status === 'true';
    const uniqueFileName = this.generateUniqueFileName(image.originalname);
    const imageUrl = this.saveImageToDisk(image, uniqueFileName);

    const banner = await this.prisma.banner.create({
      data: {
        banner_id: bannerId,
        title: data.title,
        description: data.description,
        status: statusBool,
        image_url: imageUrl,
      },
    });

    const dataToMicroService = {
      banner_id: bannerId,
      title: data.title,
      description: data.description,
      status: statusBool,
      image_url: imageUrl,
      file_buffer: image.buffer,
      file_name: uniqueFileName,
    };

    await this.handleMicroserviceCommunication(
      'create_banner',
      dataToMicroService,
    );

    return this.toBannerResponse(banner);
  }

  async update(
    banner_id: string,
    data: BannerUpdateRequestService,
    image?: Express.Multer.File,
  ): Promise<BannerResponse> {
    const banner = await this.findOne(banner_id);
    const updateRequest = this.validationService.validate(
      BannerValidation.UPDATE,
      data,
    );

    const updateData: any = {
      title: updateRequest.title ?? banner.title,
      description: updateRequest.description ?? banner.description,
      status: updateRequest.status == 'true' ? true : false,
      image_url: banner.image_url,
    };

    if (image) {
      const uniqueFileName = this.generateUniqueFileName(image.originalname);
      const imageUrl = this.saveImageToDisk(image, uniqueFileName);
      updateData.image_url = imageUrl;
    }

    const updatedBanner = await this.prisma.banner.update({
      where: { banner_id },
      data: updateData,
    });

    const dataToMicroService = {
      banner_id: banner_id,
      title: updateData.title,
      description: updateData.description,
      status: updateData.status,
      image_url: updateData.image_url,
      file_buffer: image?.buffer,
      file_name: image ? updateData.image_url.split('/').pop() : undefined,
    };

    await this.handleMicroserviceCommunication(
      'update_banner',
      dataToMicroService,
    );

    return this.toBannerResponse(updatedBanner);
  }

  async remove(banner_id: string): Promise<BannerResponse> {
    const banner = await this.findOne(banner_id);
    if (banner.image_url) {
      const filePath = join(__dirname, '../../', banner.image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Deleted file:', filePath);
      } else {
        console.warn('File not found:', filePath);
      }
    }

    const deleteBanner = await this.prisma.banner.delete({
      where: { banner_id },
    });

    await this.handleMicroserviceCommunication('delete_banner', banner_id);

    return this.toBannerResponse(deleteBanner);
  }
}
