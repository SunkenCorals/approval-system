import { Module } from '@nestjs/common';
import { AttachmentController } from './attachment.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AttachmentController],
})
export class AttachmentModule {}