import React from 'react';
import { Table, Button, Tag, Space, Tooltip, Card } from 'antd';
import { 
  EditOutlined, 
  UndoOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { ApprovalListItem, ApprovalStatus } from '@/types';
import '@/styles/ApprovalList.css';

interface ApprovalTableProps {
  data: { list: ApprovalListItem[]; total: number } | undefined;
  loading: boolean;
  page: number;
  pageSize: number;
  role: 'applicant' | 'approver';
  onPageChange: (page: number, pageSize: number) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onWithdraw: (id: number) => void;
}

/**
 * 组件: ApprovalTable
 * 职责: 展示审批数据列表，处理列渲染与操作按钮逻辑
 */
export const ApprovalTable: React.FC<ApprovalTableProps> = ({
  data,
  loading,
  page,
  pageSize,
  role,
  onPageChange,
  onView,
  onEdit,
  onWithdraw,
}) => {
  
  /**
   * 定义表格列
   * 使用百分比宽度实现自适应布局
   */
  const columns = [
    { 
      title: '单号', 
      dataIndex: 'serialNo', 
      width: '15%',
      render: (text: string, record: ApprovalListItem) => (
        <a 
          onClick={() => onView(record.id)} 
          className="serial-no-link"
        >
          {text}
        </a>
      )
    },
    { 
      title: '项目名称', 
      dataIndex: 'projectName', 
      ellipsis: true,
      width: '20%',
    },
    { 
      title: '部门', 
      dataIndex: 'departmentPath', 
      width: '20%',
      ellipsis: {
        showTitle: false, // 使用自定义 Tooltip 替代默认 title
      },
      render: (text: string) => (
        <Tooltip title={text} placement="topLeft">
          {text}
        </Tooltip>
      )
    },
    { 
      title: '申请人', 
      dataIndex: 'creatorName', 
      width: '10%',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: '10%',
      render: (status: ApprovalStatus) => {
        const config = {
          [ApprovalStatus.APPROVED]: { color: 'success', text: '已通过', icon: <CheckCircleOutlined /> },
          [ApprovalStatus.REJECTED]: { color: 'error', text: '已驳回', icon: <CloseCircleOutlined /> },
          [ApprovalStatus.WITHDRAWN]: { color: 'default', text: '已撤回', icon: <StopOutlined /> },
          [ApprovalStatus.PENDING]: { color: 'processing', text: '待审批', icon: <ClockCircleOutlined /> },
        };
        const { color, text, icon } = (config[status] || { color: 'default', text: status }) as { color: string; text: string; icon?: React.ReactNode };
        return (
          <Tag color={color} icon={icon} bordered={false}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: '15%',
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180, 
      render: (_: any, record: ApprovalListItem) => {
        // 申请人操作: 修改/撤回 (包括禁用状态)
        if (role === 'applicant') {
          const isPending = record.status === ApprovalStatus.PENDING;
          
          let tooltipText = '';
          if (record.status === ApprovalStatus.APPROVED) tooltipText = '审批已通过，单据不可修改或撤回';
          else if (record.status === ApprovalStatus.REJECTED) tooltipText = '已驳回的单需重新发起，不可再修改或撤回';
          else if (record.status === ApprovalStatus.WITHDRAWN) tooltipText = '单据已撤回，如需调整请新建申请';

          // 封装一个带 Tooltip 的按钮组件
          const ActionButton = ({ 
            label, 
            icon, 
            danger, 
            onClick 
          }: { 
            label: string, 
            icon: React.ReactNode, 
            danger?: boolean, 
            onClick: () => void 
          }) => {
            const btn = (
              <Button 
                size="small"
                icon={icon}
                danger={danger}
                disabled={!isPending}
                onClick={onClick}
              >
                {label}
              </Button>
            );

            return isPending ? btn : <Tooltip title={tooltipText}>{btn}</Tooltip>;
          };

          return (
            <Space size={8}>
              <ActionButton 
                label="修改" 
                icon={<EditOutlined />} 
                onClick={() => onEdit(record.id)} 
              />
              <ActionButton 
                label="撤回" 
                icon={<UndoOutlined />} 
                danger 
                onClick={() => onWithdraw(record.id)} 
              />
            </Space>
          );
        }

        // 审批人操作: 审批 (已处理的单子显示已审批状态，或者也可以参考上面的逻辑显示置灰的审批按钮，
        // 但审批人一般只需要处理待审批的，已审批的单子通常不需要再审批，这里为了保持一致性，
        // 我们也显示置灰的“审批”按钮，提示已处理)
        if (role === 'approver') {
             const isPending = record.status === ApprovalStatus.PENDING;
             // 审批人对于非 pending 状态，通常不需要操作，但也为了对齐，可以显示置灰
             // 或者如果需求没明确审批人也要置灰，可以保持现状。
             // 考虑到"布局稳定"，我们也给审批人加上置灰状态
             
             let tooltipText = '';
             if (!isPending) tooltipText = '该单据已结束流程';

             const btn = (
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<EditOutlined />}
                  disabled={!isPending}
                  onClick={() => onView(record.id)}
                >
                  审批
                </Button>
             );

             return isPending ? btn : <Tooltip title={tooltipText}>{btn}</Tooltip>;
        }

        // 其他状态: 用 - 占位，避免空着不好看
        return <span className="action-view-detail">-</span>;
      },
    },
  ];

  return (
    <Card variant="borderless">
      <Table
        size="middle"
        rowKey="id"
        columns={columns}
        dataSource={data?.list}
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data?.total || 0,
          onChange: onPageChange,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </Card>
  );
};
