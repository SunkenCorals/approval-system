import { Module } from '@nestjs/common';
import { ApprovalModule } from './modules/approval/approval.module';
import { AttachmentModule } from './modules/attachment/attachment.module';
import { FormConfigModule } from './modules/form-config/form-config.module';
import { DepartmentModule } from './modules/department/department.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ApprovalModule,
    AttachmentModule,
    FormConfigModule,
    DepartmentModule,
  ],
})
export class AppModule {}
