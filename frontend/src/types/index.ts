export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface ApprovalListItem {
  id: number;
  serialNo: string;
  projectName: string;
  departmentPath: string;
  status: ApprovalStatus;
  creatorName: string;
  creatorId: string;
  createdAt: string;
  approvedAt?: string;
  executeDate: string;
}

export interface ApprovalDetail extends ApprovalListItem {
  content: string;
  departmentIds: string[]; // JSON parsed
  rejectReason?: string;
  attachments: Attachment[];
  approverName?: string;
}

export interface Attachment {
  id: number;
  type: 'IMAGE' | 'EXCEL';
  filename: string;
  path: string;
  url: string; // Helper for frontend
}

export interface Department {
  id: string;
  name: string;
  parentId?: string;
  path: string;
  level: number;
}

export interface DepartmentTreeNode {
  value: string;
  label: string;
  children?: DepartmentTreeNode[];
}

export interface FormConfigField {
  field: string;
  name: string;
  component: 'Input' | 'Textarea' | 'DepartmentSelect' | 'DatePicker';
  validator: {
    required?: boolean;
    maxCount?: number;
  };
}
