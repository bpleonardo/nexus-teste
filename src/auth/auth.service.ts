import { DatabaseService } from '@/database/database.service';
import * as argon2 from 'argon2';
import { ConflictException, Injectable } from '@nestjs/common';
import type { RegisterDTO } from '@/dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(private dbService: DatabaseService) {}

  private async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async register(dto: RegisterDTO) {
    try {
      await this.dbService.$transaction(async (tx) => {
        let user = await tx.user.create({
          data: { name: dto.name, email: dto.email, cpf: dto.cpf, phone: dto.phone },
        });

        await tx.userAddress.create({
          data: {
            userId: user.id,
            ...dto.address,
          },
        });

        await tx.userCredentials.create({
          data: {
            userId: user.id,
            password: await this.hashPassword(dto.password),
          },
        });

        return true;
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.table(error.meta.target);
        throw new ConflictException({
          status: 409,
          message: 'User with this email, cpf, or phone already exists.',
        });
      }
      throw error;
    }
  }
}
