import React from 'react';
import { Card, Form, Input, DatePicker, Button, Segmented, Space, Typography } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { ApprovalStatus } from '@/types';
import '@/styles/ApprovalList.css';

const { RangePicker } = DatePicker;
const { Title } = Typography;

interface ApprovalFilterProps {
  role: 'applicant' | 'approver';
  onRoleChange: (val: 'applicant' | 'approver') => void;
  onSearch: (values: any) => void;
  onCreate: () => void;
  loading?: boolean;
}

/**
 * 组件: ApprovalFilter
 * 职责: 顶部筛选区域，包含角色切换、状态筛选、关键字搜索及新建按钮
 */
export const ApprovalFilter: React.FC<ApprovalFilterProps> = ({
  role,
  onRoleChange,
  onSearch,
  onCreate,
  loading,
}) => {
  const [form] = Form.useForm();

  /**
   * 处理表单重置
   */
  const handleReset = () => {
    form.resetFields();
    onSearch({});
  };

  return (
    <Card 
      variant="borderless"
      className="filter-card"
    >
      {/* 顶部标题与角色切换 */}
      <div className="filter-header">
        <Title level={4} className="filter-title">审批中心</Title>
        <Space>
          <span>当前视角：</span>
          <Segmented
            options={[
              { label: '申请人', value: 'applicant' },
              { label: '审批人', value: 'approver' },
            ]}
            value={role}
            onChange={(val) => onRoleChange(val as any)}
          />
        </Space>
      </div>

      {/* 筛选表单 */}
      <div className="filter-form-container">
        <Form form={form} layout="inline" onFinish={onSearch} className="filter-form">
          <Form.Item name="status" label="状态">
            <Segmented
              options={[
                { label: '全部', value: '' },
                { label: '待审批', value: ApprovalStatus.PENDING },
                { label: '已通过', value: ApprovalStatus.APPROVED },
                { label: '已驳回', value: ApprovalStatus.REJECTED },
              ]}
            />
          </Form.Item>
          <Form.Item name="projectKeyword" label="项目">
            <Input placeholder="搜索项目名称" allowClear className="project-input" />
          </Form.Item>
          <Form.Item name="createdRange" label="提交时间">
             <RangePicker className="date-range-picker" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                查询
              </Button>
              <Button onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
        
        {/* 仅申请人显示新建按钮 */}
        {role === 'applicant' && (
          <div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={onCreate}
            >
              新建审批
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
