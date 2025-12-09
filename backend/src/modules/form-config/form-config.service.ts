import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FormConfigService {
  constructor(private prisma: PrismaService) {}

  async getSchema(key: string) {
    let config = await this.prisma.formConfig.findUnique({ where: { key } });
    
    if (!config) {
    // 如果数据库里没有
      const defaultSchema = [
        { field: "projectName", name: "审批项目", component: "Input", validator: { required: true, maxCount: 20 } },
        { field: "content", name: "审批内容", component: "Textarea", validator: { required: true, maxCount: 300 } },
        { field: "departmentIds", name: "部门", component: "DepartmentSelect", validator: { required: true } },
        { field: "executeDate", name: "执行日期", component: "DatePicker", validator: { required: true } }
      ];
      
      config = await this.prisma.formConfig.create({
        data: {
          key,
          schema: JSON.stringify(defaultSchema),
          remark: 'Default Approval Form',
        },
      });
    }

    return JSON.parse(config.schema);
  }
}
