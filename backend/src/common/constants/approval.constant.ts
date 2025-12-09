/**
 * 审批状态枚举
 */
export enum ApprovalStatus {
  /** 待审批 */
  PENDING = 'PENDING',
  /** 已通过 */
  APPROVED = 'APPROVED',
  /** 已驳回 */
  REJECTED = 'REJECTED',
  /** 已撤回 */
  WITHDRAWN = 'WITHDRAWN',
}

/**
 * 附件类型枚举
 */
export enum AttachmentType {
  /** 图片 */
  IMAGE = 'IMAGE',
  /** Excel 文档 */
  EXCEL = 'EXCEL',
}

/** 最大上传图片数量 */
export const MAX_IMAGE_COUNT = 5;
/** 最大上传 Excel 数量 */
export const MAX_EXCEL_COUNT = 1;
