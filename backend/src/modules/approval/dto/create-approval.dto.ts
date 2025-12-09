import { IsString, IsNotEmpty, MaxLength, IsArray, ArrayMinSize, IsDateString } from 'class-validator';

export class CreateApprovalDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: 'Project name must be within 20 characters' })
  projectName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300, { message: 'Content must be within 300 characters' })
  content: string;

  @IsArray()
  @ArrayMinSize(3, { message: 'Department must select at least 3 levels' })
  @IsString({ each: true })
  departmentIds: string[];

  @IsDateString()
  @IsNotEmpty()
  executeDate: string;
}
