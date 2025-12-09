import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { UpdateApprovalDto } from './dto/update-approval.dto';
import { ApprovalQueryDto } from './dto/query-approval.dto';
import { ApprovalStatus } from '../../common/constants/approval.constant';
import { startOfToday, isBefore, addDays } from 'date-fns';

@Injectable()
export class ApprovalService {
  constructor(private prisma: PrismaService) {}

  /**
   * 校验审批状态流转是否合法
   * 
   * 规则:
   * 1. 终态 (APPROVED, REJECTED, WITHDRAWN) 不可再流转
   * 2. PENDING 状态可以流转到任意终态
   * 3. 其他流转视为非法
   * 
   * @param current 当前状态
   * @param next 下一状态
   * @throws BadRequestException 当流转非法时抛出
   */
  validateTransition(current: string, next: ApprovalStatus) {
    if (current === next) return;
    if (
      current === ApprovalStatus.APPROVED ||
      current === ApprovalStatus.REJECTED ||
      current === ApprovalStatus.WITHDRAWN
    ) {
      throw new BadRequestException(`Cannot update from final status ${current}`);
    }

    // Valid transitions from PENDING
    if (current === ApprovalStatus.PENDING) {
      if (
        next === ApprovalStatus.APPROVED ||
        next === ApprovalStatus.REJECTED ||
        next === ApprovalStatus.WITHDRAWN
      ) {
        return;
      }
    }

    throw new BadRequestException(`Invalid status transition from ${current} to ${next}`);
  }

  /**
   * 权限校验
   * 
   * 规则:
   * 1. UPDATE/WITHDRAW: 仅申请人 (applicant) 且是本人创建的单据可操作
   * 2. APPROVE/REJECT: 仅审批人 (approver) 且非本人创建的单据可操作
   * 
   * @param userId 当前用户ID
   * @param role 当前用户角色
   * @param approval 审批单对象
   * @param action 动作类型
   * @throws ForbiddenException 当权限不足时抛出
   */
  validatePermission(
    userId: string,
    role: string,
    approval: { creatorId: string },
    action: 'UPDATE' | 'WITHDRAW' | 'APPROVE' | 'REJECT',
  ) {
    if (action === 'UPDATE' || action === 'WITHDRAW') {
      if (role !== 'applicant') throw new ForbiddenException('Only applicant can update/withdraw');
      if (approval.creatorId !== userId) throw new ForbiddenException('Not the creator');
    }
    if (action === 'APPROVE' || action === 'REJECT') {
      if (role !== 'approver') throw new ForbiddenException('Only approver can approve/reject');
      if (approval.creatorId === userId) throw new ForbiddenException('Cannot approve your own request');
    }
  }

  /**
   * 生成审批单号
   * 格式: AP-YYYYMMDD-XXXX (例如: AP-20231027-0001)
   * 
   * @returns 生成的单号字符串
   */
  private async generateSerialNo() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.approval.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(24, 0, 0, 0)),
        },
      },
    });
    return `AP-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }

  /**
   * 构建部门全路径字符串
   * 
   * @param departmentIds 部门ID列表
   * @returns 拼接后的部门名称路径 (e.g. "技术部 / 研发一部")
   */
  private async buildDepartmentPath(departmentIds: string[]) {
    const depts = await this.prisma.department.findMany({
      where: { id: { in: departmentIds } },
    });

    const deptMap = new Map(depts.map((d) => [d.id, d.name]));
    return departmentIds.map((id) => deptMap.get(id) || id).join(' / ');
  }

  /**
   * 创建审批单
   * 
   * @param dto 创建参数
   * @param userId 创建人ID
   * @param userName 创建人姓名
   * @returns 创建后的审批单
   */
  async create(dto: CreateApprovalDto, userId: string, userName: string) {
    if (isBefore(new Date(dto.executeDate), startOfToday())) {
      throw new BadRequestException('Execute date cannot be in the past');
    }

    const serialNo = await this.generateSerialNo();
    const departmentPath = await this.buildDepartmentPath(dto.departmentIds);

    return this.prisma.approval.create({
      data: {
        serialNo,
        projectName: dto.projectName,
        content: dto.content,
        departmentIds: JSON.stringify(dto.departmentIds),
        departmentPath,
        executeDate: new Date(dto.executeDate),
        creatorId: userId,
        creatorName: userName,
        status: ApprovalStatus.PENDING,
      },
    });
  }

  /**
   * 查询审批列表
   * 支持分页、状态筛选、关键字搜索、时间范围筛选
   * 
   * @param query 查询参数
   * @returns 分页列表数据
   */
  async findAll(query: ApprovalQueryDto) {
    const { page = 1, pageSize = 10, status, projectKeyword, departmentPath, createdStart, createdEnd } = query;
    const where: any = { deleted: false };

    if (status) where.status = status;
    if (projectKeyword) where.projectName = { contains: projectKeyword };
    if (departmentPath) where.departmentPath = { contains: departmentPath };
    if (createdStart || createdEnd) {
      where.createdAt = {};
      if (createdStart) where.createdAt.gte = new Date(createdStart);
      if (createdEnd) where.createdAt.lte = addDays(new Date(createdEnd), 1);
    }

    const [list, total] = await Promise.all([
      this.prisma.approval.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.approval.count({ where }),
    ]);

    return { list, total, page, pageSize };
  }

  /**
   * 查询审批单详情
   * 包含附件信息
   * 
   * @param id 审批单ID
   * @returns 详情数据
   */
  async findOne(id: number) {
    const approval = await this.prisma.approval.findUnique({
      where: { id },
      include: { attachments: true },
    });
    if (!approval) throw new NotFoundException('Approval not found');
    return {
      ...approval,
      departmentIds: JSON.parse(approval.departmentIds),
    };
  }

  /**
   * 更新审批单
   * 仅限申请人修改，且必须在 PENDING 状态
   * 
   * @param id 审批单ID
   * @param dto 更新参数
   * @param userId 当前用户ID
   * @param role 当前用户角色
   */
  async update(id: number, dto: UpdateApprovalDto, userId: string, role: string) {
    const approval = await this.prisma.approval.findUnique({ where: { id } });
    if (!approval) throw new NotFoundException('Approval not found');

    this.validatePermission(userId, role, approval, 'UPDATE');
    this.validateTransition(approval.status, ApprovalStatus.PENDING); // Still PENDING

    let departmentPath = undefined;
    if (dto.departmentIds) {
      departmentPath = await this.buildDepartmentPath(dto.departmentIds);
    }

    return this.prisma.approval.update({
      where: { id },
      data: {
        ...dto,
        departmentIds: dto.departmentIds ? JSON.stringify(dto.departmentIds) : undefined,
        departmentPath,
        executeDate: dto.executeDate ? new Date(dto.executeDate) : undefined,
      },
    });
  }

  /**
   * 撤回审批单
   * 仅限申请人操作
   * 
   * @param id 审批单ID
   * @param userId 当前用户ID
   * @param role 当前用户角色
   */
  async withdraw(id: number, userId: string, role: string) {
    const approval = await this.prisma.approval.findUnique({ where: { id } });
    if (!approval) throw new NotFoundException('Approval not found');

    this.validatePermission(userId, role, approval, 'WITHDRAW');
    this.validateTransition(approval.status, ApprovalStatus.WITHDRAWN);

    return this.prisma.approval.update({
      where: { id },
      data: { status: ApprovalStatus.WITHDRAWN, approvedAt: new Date() },
    });
  }

  /**
   * 通过审批
   * 仅限审批人操作
   * 
   * @param id 审批单ID
   * @param userId 审批人ID
   * @param userName 审批人姓名
   * @param role 当前用户角色
   */
  async approve(id: number, userId: string, userName: string, role: string) {
    const approval = await this.prisma.approval.findUnique({ where: { id } });
    if (!approval) throw new NotFoundException('Approval not found');

    this.validatePermission(userId, role, approval, 'APPROVE');
    this.validateTransition(approval.status, ApprovalStatus.APPROVED);

    return this.prisma.approval.update({
      where: { id },
      data: {
        status: ApprovalStatus.APPROVED,
        approverId: userId,
        approverName: userName,
        approvedAt: new Date(),
      },
    });
  }

  /**
   * 驳回审批
   * 仅限审批人操作
   * 
   * @param id 审批单ID
   * @param userId 审批人ID
   * @param userName 审批人姓名
   * @param role 当前用户角色
   * @param reason 驳回理由
   */
  async reject(id: number, userId: string, userName: string, role: string, reason: string) {
    const approval = await this.prisma.approval.findUnique({ where: { id } });
    if (!approval) throw new NotFoundException('Approval not found');

    this.validatePermission(userId, role, approval, 'REJECT');
    this.validateTransition(approval.status, ApprovalStatus.REJECTED);

    return this.prisma.approval.update({
      where: { id },
      data: {
        status: ApprovalStatus.REJECTED,
        approverId: userId,
        approverName: userName,
        rejectReason: reason,
        approvedAt: new Date(),
      },
    });
  }
}
