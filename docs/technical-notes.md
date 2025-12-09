# 技术实现细节 (Technical Notes)

## 1. 动态表单 (Dynamic Form)

### 1.1 核心设计
后端 `FormConfig` 表存储 JSON Schema，前端 `DynamicForm` 组件负责解析渲染。
这样做的好处是：表单字段变更无需重新发布前端，只需修改数据库配置。

### 1.2 组件映射表
前端 `src/components/DynamicForm/index.tsx` 维护映射关系：
- `Input` -> `antd.Input`
- `Textarea` -> `antd.Input.TextArea`
- `DatePicker` -> `antd.DatePicker`
- `DepartmentSelect` -> 自定义 `DepartmentSelect` (基于 `Cascader`)

### 1.3 校验规则映射
后端配置中的 `validator` 对象会自动转换为 Ant Design Form 的 `rules`：
- `required: true` -> `{ required: true, message: '...' }`
- `maxCount: 20` -> `{ max: 20, message: '...' }`

## 2. 附件上传 (File Upload)

### 2.1 存储策略
使用 `Multer` 的 `diskStorage` 引擎，将文件存储在 `backend/uploads` 目录。
- 文件名生成：随机 32 位 hex 字符串 + 原始后缀，防止文件名冲突。
- 路径存储：数据库 `Attachment` 表存储相对路径。

### 2.2 限制与校验
在 `AttachmentController` 中使用 `fileFilter` 和逻辑校验：
- MIME 类型白名单：`image/*`, `application/vnd.openxmlformats...` (Excel)
- 数量限制：`MAX_IMAGE_COUNT = 5`, `MAX_EXCEL_COUNT = 1`

### 2.3 关联机制
采用 "Post-Association" 模式：
1. 创建审批单 -> 获得 `id`
2. 上传文件 -> 携带 `approvalId` -> 插入 `Attachment` 表
这样避免了孤儿文件问题。

## 3. 权限与状态机 (Permission & State Machine)

### 3.1 状态流转矩阵
| 当前状态 | 动作 | 目标状态 | 角色要求 |
| --- | --- | --- | --- |
| PENDING | WITHDRAW | WITHDRAWN | Applicant (Creator) |
| PENDING | APPROVE | APPROVED | Approver |
| PENDING | REJECT | REJECTED | Approver |
| PENDING | UPDATE | PENDING | Applicant (Creator) |

### 3.2 校验逻辑 (`ApprovalService`)
- **State Guard**: `validateTransition(current, next)` 确保状态不回退、不跳跃。
- **Permission Guard**: `validatePermission(user, role, approval, action)` 确保操作人合法。

## 4. 部门数据处理

### 4.1 路径快照
审批单创建时，后端根据 `departmentIds` 实时查询部门树，生成 `departmentPath` 字符串（如 "A Dept / A1 Sub"）存入 `Approval` 表。
**原因**: 部门组织架构可能会变，但历史审批单的部门归属应保持创建时的快照。

### 4.2 前端级联选择
`DepartmentSelect` 组件接收扁平的部门列表（包含 `parentId`），使用 `useMemo` 递归构建 Antd Cascader 需要的 `options` 树形结构。
