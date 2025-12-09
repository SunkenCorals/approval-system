import { IsString, MaxLength, IsNotEmpty } from 'class-validator';

export class RejectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
