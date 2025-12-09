import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('departments')
export class DepartmentController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll() {
    // Seed if empty
    const count = await this.prisma.department.count();
    if (count === 0) {
      await this.prisma.department.createMany({
        data: [
          { id: 'A', name: '技术部', level: 1, path: '技术部' },
          { id: 'A1', name: '研发中心', level: 2, parentId: 'A', path: '技术部 / 研发中心' },
          { id: 'A1-1', name: '前端组', level: 3, parentId: 'A1', path: '技术部 / 研发中心 / 前端组' },
          { id: 'B', name: '产品部', level: 1, path: '产品部' },
        ],
      });
    }

    const departments = await this.prisma.department.findMany();
    return this.buildTree(departments);
  }

  private buildTree(items: any[], parentId: string | null = null): any[] {
    return items
      .filter((item) => {
        if (parentId === null) {
          return !item.parentId;
        }
        return item.parentId === parentId;
      })
      .map((item) => {
        const children = this.buildTree(items, item.id);
        return {
          value: item.id,
          label: item.name,
          children: children.length > 0 ? children : undefined,
        };
      });
  }
}
