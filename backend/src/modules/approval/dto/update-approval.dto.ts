import { IsString, MaxLength, IsArray, ArrayMinSize, IsDateString, IsOptional } from 'class-validator';

export class UpdateApprovalDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  projectName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  content?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(3)
  @IsString({ each: true })
  departmentIds?: string[];

  @IsOptional()
  @IsDateString()
  executeDate?: string;
}
