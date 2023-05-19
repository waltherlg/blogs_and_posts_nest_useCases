import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'loginOrEmail' });
  }
  async validate(loginOrEmail: string, password: string) {
    console.log(loginOrEmail);
    const userId = await this.authService.checkUserCredential(
      loginOrEmail,
      password,
    );
    if (!userId) {
      throw new UnauthorizedException();
    }
    return userId;
  }
}
