import { Controller, Get, Param } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreResponse } from './../model/store.model';
import { WebResponse } from 'src/model/web.model';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import { join } from 'path';
import { MessagePattern } from '@nestjs/microservices';

@Controller('/api/store')
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
    private readonly httpService: HttpService,
  ) {}

  @Get()
  async findAll(): Promise<WebResponse<StoreResponse[]>> {
    return await this.storeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<WebResponse<StoreResponse>> {
    const store = await this.storeService.findOne(id);
    return {
      data: store,
    };
  }

  @MessagePattern('create_store')
  async createStore(data: any): Promise<any> {
    const {
      store_id,
      store_name,
      longitude,
      latitude,
      file_buffer,
      file_name,
    } = data;

    let imageUrl = null;

    if (file_buffer && file_name) {
      const uploadPath = join(__dirname, '../../uploads/storeLogo', file_name);

      if (!fs.existsSync(join(__dirname, '../../uploads/storeLogo'))) {
        fs.mkdirSync(join(__dirname, '../../uploads/storeLogo'), {
          recursive: true,
        });
      }
      fs.writeFileSync(uploadPath, Buffer.from(file_buffer));
      console.log('File saved locally as:', file_name);

      imageUrl = `/uploads/storeLogo/${file_name}`;
    }
    const parsedLongitude = parseFloat(longitude as any);
    const parsedLatitude = parseFloat(latitude as any);

    const store = await this.storeService.create({
      store_id,
      store_name,
      longitude: parsedLongitude,
      latitude: parsedLatitude,
      image_url: imageUrl,
    });

    console.log('Store data saved:', store);
    return store;
  }

  @MessagePattern('update_store')
  async updateStore(data: any): Promise<StoreResponse> {
    const { id, store_name, longitude, latitude, file_buffer, file_name } =
      data;
    console.log(file_name);
    const updateData: any = {};

    if (store_name !== undefined) {
      updateData.store_name = store_name;
    }
    if (longitude !== undefined) {
      updateData.longitude = parseFloat(longitude as any);
    }
    if (latitude !== undefined) {
      updateData.latitude = parseFloat(latitude as any);
    }

    let imageUrl;
    if (file_buffer && file_name) {
      const uploadPath = join(__dirname, '../../uploads/storeLogo', file_name);

      if (!fs.existsSync(join(__dirname, '../../uploads/storeLogo'))) {
        fs.mkdirSync(join(__dirname, '../../uploads/storeLogo'), {
          recursive: true,
        });
      }
      fs.writeFileSync(uploadPath, Buffer.from(file_buffer));

      imageUrl = `/uploads/storeLogo/${file_name}`;
      updateData.image_url = imageUrl;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields provided for update');
    }

    const updatedStore = await this.storeService.update(id, updateData);
    return updatedStore;
  }

  @MessagePattern('delete_store')
  async remove(id: string): Promise<WebResponse<StoreResponse>> {
    const store = await this.storeService.remove(id);
    if (store.image_url) {
      const filePath = join(__dirname, '../../', store.image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Deleted file:', filePath);
      } else {
        console.warn('File not found:', filePath);
      }
    }
    return {
      data: store,
    };
  }
}
