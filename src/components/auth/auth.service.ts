import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { SignupDto } from '../../libs/dto/signup.dto';
import { LoginDto } from '../../libs/dto/login.dto';
import MemberSchema from '../../schemas/Member.model';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    @InjectModel('Member') private memberModel: Model<any>,
    private readonly jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return bcrypt.hash(password, salt);
  }

  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async createToken(member: any): Promise<string> {
    const payload = {
      _id: member._id.toString(),
      email: member.email,
      name: member.name,
      role: member.role || 'USER',
    };
    return this.jwtService.signAsync(payload);
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async signup(signupDto: SignupDto) {
    const { email, password, name } = signupDto;

    // Check if member with this email already exists
    const existingMember = await this.memberModel.findOne({ email });
    if (existingMember) {
      throw new ConflictException('Email already in use');
    }

    // Hash the password
    const passwordHash = await this.hashPassword(password);

    // Create new member
    const newMember = new this.memberModel({
      email,
      passwordHash,
      name,
    });

    const savedMember = await newMember.save();

    // Create token
    const token = await this.createToken(savedMember);

    // Return member without passwordHash
    const { passwordHash: _, ...memberResponse } = savedMember.toObject();
    return {
      member: memberResponse,
      accessToken: token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find member by email with passwordHash
    const member = await this.memberModel
      .findOne({ email })
      .select('+passwordHash');
    if (!member) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare passwords
    const isPasswordValid = await this.comparePasswords(
      password,
      member.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Create token
    const token = await this.createToken(member);

    // Return member without passwordHash
    const { passwordHash: _, ...memberResponse } = member.toObject();
    return {
      member: memberResponse,
      accessToken: token,
    };
  }
}
