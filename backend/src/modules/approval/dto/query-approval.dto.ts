import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApprovalStatus } from '../../../common/constants/approval.constant';

export class ApprovalQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  status?: ApprovalStatus;

  @IsOptional()
  @IsString()
  projectKeyword?: string;

  @IsOptional()
  @IsString()
  departmentPath?: string;

  @IsOptional()
  @IsString()
  createdStart?: string;

  @IsOptional()
  @IsString()
  createdEnd?: string;

  @IsOptional()
  @IsString()
  approvedStart?: string;

  @IsOptional()
  @IsString()
  approvedEnd?: string;
}
