import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from '../../libs/dto/signup.dto';
import { LoginDto } from '../../libs/dto/login.dto';
import { AuthGuard, RolesGuard } from './guards';
import { Roles, GetAuthMember } from './decorators';
import { MemberRole } from '../../libs/enums/roles.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }
  
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Example: Protected route with authentication
  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@GetAuthMember() authMember: any) {
    return {
      message: 'This is a protected route',
      member: authMember,
    };
  }

  // Example: Protected route with role-based access
  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(MemberRole.ADMIN)
  async adminOnly(@GetAuthMember() authMember: any) {
    return {
      message: 'This is an admin-only route',
      member: authMember,
    };
  }
}
