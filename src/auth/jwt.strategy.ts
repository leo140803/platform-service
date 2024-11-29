import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// Define a type for the payload
interface JwtPayload {
  username: string;
  sub: string; // This could be admin_id or user_id based on your schema
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'testing-secret',
    });
  }

  async validate(payload: JwtPayload) {
    return { admin_id: payload.sub, username: payload.username };
  }
}
