import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { AdminRequest, AdminResponse } from 'src/model/admin.model';
import * as bcrypt from 'bcrypt';
import { Admin } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  toAdminResponse(admin: Admin): any {
    return {
      admin_id: admin.admin_id,
      username: admin.username,
    };
  }

  async register(data: AdminRequest): Promise<AdminResponse> {
    const existingAdmin = await this.prismaService.admin.findUnique({
      where: { username: data.username },
    });

    if (existingAdmin) {
      throw new HttpException('Username already exists', 500);
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    console.log(hashedPassword);
    const admin = await this.prismaService.admin.create({
      data: {
        username: data.username,
        password: hashedPassword,
      },
    });
    return this.toAdminResponse(admin);
  }

  async validateUser(data: AdminRequest): Promise<Admin | null> {
    const admin = await this.prismaService.admin.findUnique({
      where: { username: data.username },
    });
    if (admin && (await bcrypt.compare(data.password, admin.password))) {
      return admin;
    }
    return null;
  }

  async login(data: Admin): Promise<any> {
    const payLoad = { username: data.username, sub: data.admin_id };
    return {
      access_token: this.jwtService.sign(payLoad),
    };
  }
}
