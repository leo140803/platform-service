import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import {
  BannerRequestController,
  BannerResponse,
  BannerUpdateRequestController,
} from 'src/model/banner.model';
import { WebResponse } from 'src/model/web.model';
import { ImageFileInterceptorForBanner } from 'src/common/multer.config';

@Controller('/api/banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get()
  async findAll(): Promise<WebResponse<BannerResponse[]>> {
    return { data: await this.bannerService.findAll() };
  }

  @Get('/active')
  async findAllActive(): Promise<WebResponse<BannerResponse[]>> {
    return { data: await this.bannerService.findAllActive() };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<WebResponse<BannerResponse>> {
    return { data: await this.bannerService.findOne(id) };
  }

  @Post()
  @UseInterceptors(ImageFileInterceptorForBanner())
  async create(
    @Body() body: BannerRequestController,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<WebResponse<BannerResponse>> {
    if (!image) throw new HttpException('MUST UPLOAD IMAGE!', 500);

    const banner = await this.bannerService.create(body, image);
    return { data: banner };
  }

  @Patch(':id')
  @UseInterceptors(ImageFileInterceptorForBanner())
  async update(
    @Param('id') id: string,
    @Body() body: BannerUpdateRequestController,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<WebResponse<BannerResponse>> {
    const updatedBanner = await this.bannerService.update(id, body, image);
    return { data: updatedBanner };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<WebResponse<BannerResponse>> {
    const banner = await this.bannerService.remove(id);
    return { data: banner };
  }
}
