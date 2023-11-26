import { 
  Injectable,
  NotFoundException,
 } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomString } from '../../../shared/utils/random-string';
import { Code } from '../schema/code.schema';
import { DeleteResult } from 'mongodb';
import { UserConfig } from '../user.config';

@Injectable()
export class CodeService {

  constructor(
    @InjectModel(Code.name) private codeModel: Model<Code>,
  ) {}

  async create(email: string): Promise<Code> {
    await this.delete(email);

    return await this.codeModel.findOneAndUpdate(
      {email},
      {
        code: randomString(25),
        expiration: new Date(
          Date.now() + UserConfig.codeExpiration,
        ),
      },
      {new: true, upsert: true}
    ).lean();
  }

  async get(code: string, email: string): Promise<Code|null> {
    return await this.codeModel.findOne({ code, email }).lean()
  }
  async getByCode(code: string) {
    return await this.codeModel.findOne({ code}).lean()
  }

  async validateCode(code: string, email: string): Promise<Code> {
    const acode = await this.get(code, email);
    return await this.validate(acode);
  }

  async validateByCode(code: string): Promise<Code> {
    const acode = await this.getByCode(code);
    return await this.validate(acode)
  }

  async validate(acode: Code|null) {
    if (!acode) {
      throw new NotFoundException('Code not found');
    }

    if (acode.expiration.getTime() < Date.now()) {
      await this.delete(acode.email);

      throw new NotFoundException('Code has expired');
    }
    return acode;
  }

  async delete(email: string): Promise<DeleteResult> {
    return await this.codeModel.deleteMany({ email });
  }
}
