import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
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
import { v4 as uuidv4 } from 'uuid';
import { join, extname } from 'path';
import * as fs from 'fs';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('/api/banner')
export class BannerController {
  constructor(
    private readonly bannerService: BannerService,
    @Inject('MARKETPLACE_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get()
  async findAll(): Promise<WebResponse<BannerResponse[]>> {
    return {
      data: await this.bannerService.findAll(),
    };
  }

  @Get('/active')
  async findAllActive(): Promise<WebResponse<BannerResponse[]>> {
    return {
      data: await this.bannerService.findAllActive(),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<WebResponse<BannerResponse>> {
    return {
      data: await this.bannerService.findOne(id),
    };
  }

  @Post()
  @UseInterceptors(ImageFileInterceptorForBanner())
  async create(
    @Body() body: BannerRequestController,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<WebResponse<BannerResponse>> {
    const bannerId = uuidv4();
    const statusBool = body.status === 'true';
    let uniqueFileName = '';
    let imageUrl;

    if (image) {
      uniqueFileName = `banner-${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(image.originalname)}`;
      const uploadPath = join(
        __dirname,
        '../../uploads/banner',
        uniqueFileName,
      );

      if (!fs.existsSync(join(__dirname, '../../uploads/banner'))) {
        fs.mkdirSync(join(__dirname, '../../uploads/banner'), {
          recursive: true,
        });
      }

      fs.writeFileSync(uploadPath, image.buffer);
      imageUrl = `/uploads/banner/${uniqueFileName}`;
    } else {
      throw new HttpException('MUST UPLOAD IMAGE!', 500);
    }

    const banner = await this.bannerService.create({
      banner_id: bannerId,
      title: body.title,
      description: body.description,
      status: statusBool,
      image_url: imageUrl,
    });

    const dataToMicroService = {
      banner_id: bannerId,
      title: body.title,
      description: body.description,
      status: statusBool,
      image_url: imageUrl,
      file_buffer: image?.buffer,
      file_name: uniqueFileName,
    };

    try {
      const response = await firstValueFrom(
        this.client.send('create_banner', dataToMicroService),
      );
      console.log(response);
    } catch (error) {
      console.error(error.message);
    }

    return {
      data: banner,
    };
  }

  @Patch(':id')
  @UseInterceptors(ImageFileInterceptorForBanner())
  async update(
    @Param('id') id: string,
    @Body() body: BannerUpdateRequestController,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<WebResponse<BannerResponse>> {
    const updateData: any = { id };
    let uniqueFileName;
    let imageUrl;
    const statusBool = body.status === 'true';

    if (body.title !== undefined) {
      updateData.title = body.title;
    }
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    if (body.status !== undefined) {
      updateData.status = statusBool;
    }

    if (image) {
      uniqueFileName = `banner-${Date.now()}-${Math.round(
        Math.random() * 1e9,
      )}${extname(image.originalname)}`;
      const uploadPath = join(
        __dirname,
        '../../uploads/banner',
        uniqueFileName,
      );

      if (!fs.existsSync(join(__dirname, '../../uploads/banner'))) {
        fs.mkdirSync(join(__dirname, '../../uploads/banner'), {
          recursive: true,
        });
      }
      fs.writeFileSync(uploadPath, image.buffer);

      imageUrl = `/uploads/banner/${uniqueFileName}`;
      updateData.file_buffer = image.buffer;
      updateData.file_name = uniqueFileName;
      updateData.image_url = imageUrl;
    }

    if (Object.keys(updateData).length === 1) {
      throw new HttpException('No fields provided for update', 500);
    }

    const updatedBanner = await this.bannerService.update(id, {
      title: updateData.title,
      description: updateData.description,
      status: updateData.status,
      image_url: updateData.image_url,
    });

    return {
      data: updatedBanner,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<WebResponse<BannerResponse>> {
    const banner = await this.bannerService.remove(id);
    if (banner.image_url) {
      const filePath = join(__dirname, '../../', banner.image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Deleted file:', filePath);
      } else {
        console.warn('File not found:', filePath);
      }
    }
    return {
      data: banner,
    };
  }
}
