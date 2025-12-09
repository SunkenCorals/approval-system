# API 文档

## 基础说明

- Base URL: `http://localhost:3001/api`
- 统一响应格式:
```json
{
  "code": 0,
  "msg": "success",
  "data": { ... }
}
```
- 权限认证: 通过 Header 模拟
  - `X-User-Id`: 用户ID (默认 u1, a1)
  - `X-User-Role`: 角色 (applicant, approver)

## 接口列表

### 1. 审批单管理

#### 1.1 分页查询审批单
- **URL**: `GET /approvals`
- **Params**:
  - `page`: number (default 1)
  - `pageSize`: number (default 10)
  - `status`: string (PENDING, APPROVED, REJECTED, WITHDRAWN)
  - `projectKeyword`: string
  - `createdStart`: ISO Date string
  - `createdEnd`: ISO Date string
- **Response**:
```json
{
  "list": [
    {
      "id": 1,
      "serialNo": "AP-20231101-0001",
      "projectName": "Project A",
      "status": "PENDING",
      "departmentPath": "A Dept / A1 Sub",
      "creatorName": "Applicant"
    }
  ],
  "total": 10
}
```

#### 1.2 查询详情
- **URL**: `GET /approvals/:id`
- **Response**: 包含完整字段及 `attachments`

#### 1.3 创建审批单
- **URL**: `POST /approvals`
- **Headers**: `X-User-Role: applicant`
- **Body**:
```json
{
  "projectName": "采购申请",
  "content": "申请采购 Macbook Pro",
  "departmentIds": ["A", "A1", "A1-1"],
  "executeDate": "2023-12-01"
}
```

#### 1.4 修改审批单
- **URL**: `PUT /approvals/:id`
- **Body**: 同创建，字段可选

#### 1.5 撤回审批单
- **URL**: `POST /approvals/:id/withdraw`
- **Headers**: `X-User-Role: applicant`

#### 1.6 审批通过
- **URL**: `POST /approvals/:id/approve`
- **Headers**: `X-User-Role: approver`

#### 1.7 驳回
- **URL**: `POST /approvals/:id/reject`
- **Headers**: `X-User-Role: approver`
- **Body**: `{ "reason": "Budget limit" }`

### 2. 附件管理

#### 2.1 上传附件
- **URL**: `POST /approvals/:id/attachments`
- **Content-Type**: `multipart/form-data`
- **Body**: `files` (Array of File)

### 3. 配置与基础数据

#### 3.1 获取表单配置
- **URL**: `GET /form-configs/:key`
- **Response**: JSON Schema for dynamic form

#### 3.2 获取部门列表
- **URL**: `GET /departments`
- **Response**: Flat list of departments
