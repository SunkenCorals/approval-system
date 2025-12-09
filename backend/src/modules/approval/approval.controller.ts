import { Controller, Get, Post, Put, Body, Param, Query, Headers, ParseIntPipe } from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { UpdateApprovalDto } from './dto/update-approval.dto';
import { ApprovalQueryDto } from './dto/query-approval.dto';
import { RejectDto } from './dto/action-approval.dto';

@Controller('approvals')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  /**
   * 创建审批单
   */
  @Post()
  create(
    @Body() createApprovalDto: CreateApprovalDto,
    @Headers('x-user-id') userId: string = 'u1', 
    @Headers('x-user-name') userName: string = '申请人',
  ) {
    return this.approvalService.create(createApprovalDto, userId, userName);
  }

  /**
   * 获取审批列表
   */
  @Get()
  findAll(@Query() query: ApprovalQueryDto) {
    return this.approvalService.findAll(query);
  }

  /**
   * 获取审批单详情
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.approvalService.findOne(id);
  }

  /**
   * 更新审批单 (仅申请人)
   */
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateApprovalDto: UpdateApprovalDto,
    @Headers('x-user-id') userId: string = 'u1',
    @Headers('x-user-role') role: string = 'applicant',
  ) {
    return this.approvalService.update(id, updateApprovalDto, userId, role);
  }

  /**
   * 撤回审批单 (仅申请人)
   */
  @Post(':id/withdraw')
  withdraw(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-user-id') userId: string = 'u1',
    @Headers('x-user-role') role: string = 'applicant',
  ) {
    return this.approvalService.withdraw(id, userId, role);
  }

  /**
   * 通过审批 (仅审批人)
   */
  @Post(':id/approve')
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-user-id') userId: string = 'a1',
    @Headers('x-user-name') userName: string = '审批人',
    @Headers('x-user-role') role: string = 'approver',
  ) {
    return this.approvalService.approve(id, userId, userName, role);
  }

  /**
   * 驳回审批 (仅审批人)
   */
  @Post(':id/reject')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() rejectDto: RejectDto,
    @Headers('x-user-id') userId: string = 'a1',
    @Headers('x-user-name') userName: string = '审批人',
    @Headers('x-user-role') role: string = 'approver',
  ) {
    return this.approvalService.reject(id, userId, userName, role, rejectDto.reason);
  }
}
