import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminRequest, AdminResponse } from 'src/model/admin.model';
import { WebResponse } from 'src/model/web.model';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(
    @Body() body: AdminRequest,
  ): Promise<WebResponse<AdminResponse>> {
    return {
      data: await this.authService.register(body),
    };
  }

  @Post('/login')
  async login(@Body() body: AdminRequest) {
    const admin = await this.authService.validateUser(body);
    if (!admin) {
      throw new HttpException('Invalid Credentials', 401);
    }

    return this.authService.login(admin);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/protected')
  getProtectedData() {
    return {
      message: 'Halloo',
    };
  }
}
