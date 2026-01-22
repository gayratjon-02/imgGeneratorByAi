import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { SignupDto } from './dto/signup.dto';
import MemberSchema from '../schemas/Member.model';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    @InjectModel('Member') private memberModel: Model<any>,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, password, name } = signupDto;

    // Check if member with this email already exists
    const existingMember = await this.memberModel.findOne({ email });
    if (existingMember) {
      throw new ConflictException('Email already in use');
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, this.saltRounds);

    // Create new member
    const newMember = new this.memberModel({
      email,
      passwordHash,
      name,
    });

    const savedMember = await newMember.save();

    // Return member without passwordHash
    const { passwordHash: _, ...memberResponse } = savedMember.toObject();
    return memberResponse;
  }
}
