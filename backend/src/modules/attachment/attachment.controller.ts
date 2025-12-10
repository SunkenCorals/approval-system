import { Controller, Post, Param, UploadedFiles, UseInterceptors, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../../prisma/prisma.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AttachmentType, MAX_IMAGE_COUNT, MAX_EXCEL_COUNT } from '../../common/constants/approval.constant';

@Controller('approvals/:id/attachments')
export class AttachmentController {
  constructor(private prisma: PrismaService) {}

  /**
   * 上传附件
   * 
   * 限制:
   * 1. 单次最多上传 10 个文件
   * 2. 仅支持图片 (jpg/jpeg/png/gif) 和 Excel (xlsx/xls)
   * 3. 单个审批单图片上限 5 张，Excel 上限 1 个
   */
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: process.env.VERCEL ? '/tmp' : './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.ms-excel)$/)) {
          return cb(new BadRequestException('Only image or excel files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFiles(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const images = files.filter(f => f.mimetype.startsWith('image/'));
    const excels = files.filter(f => !f.mimetype.startsWith('image/'));

    if (images.length > MAX_IMAGE_COUNT) {
      throw new BadRequestException(`Max ${MAX_IMAGE_COUNT} images allowed`);
    }
    if (excels.length > MAX_EXCEL_COUNT) {
      throw new BadRequestException(`Max ${MAX_EXCEL_COUNT} excel allowed`);
    }

    const attachments = await Promise.all(
      files.map((file) =>
        this.prisma.attachment.create({
          data: {
            approvalId: id,
            type: file.mimetype.startsWith('image/') ? AttachmentType.IMAGE : AttachmentType.EXCEL,
            filename: file.originalname,
            path: file.path,
            mimeType: file.mimetype,
            size: file.size,
          },
        }),
      ),
    );

    return attachments;
  }
}
