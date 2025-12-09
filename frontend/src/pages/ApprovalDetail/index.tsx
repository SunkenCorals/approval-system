import React from 'react';
import { Drawer, Descriptions, Button, Space, Image, Tag, Modal, Input, Timeline, Card } from 'antd';
import { ApprovalDetail as IApprovalDetail, ApprovalStatus } from '@/types';
import { useApprovalDetail } from '@/hooks';
import dayjs from 'dayjs';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, StopOutlined } from '@ant-design/icons';
import '@/styles/ApprovalDetail.css';

interface ApprovalDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  detail: IApprovalDetail | null;
  role: string; // 'applicant' | 'approver'
  userId: string;
}

/**
 * 组件: ApprovalDetailDrawer
 * 职责: 展示审批单详情，并提供审批人操作入口
 */
export const ApprovalDetailDrawer: React.FC<ApprovalDetailDrawerProps> = ({
  open,
  onClose,
  detail,
  role,
  userId,
}) => {
  // 使用自定义 Hook 处理审批操作
  const { approve, reject, isApproving, isRejecting } = useApprovalDetail(detail?.id);

  if (!detail) return null;

  /**
   * 处理审批通过
   */
  const handleApprove = async () => {
    try {
      await approve();
      onClose();
    } catch (error) {
      // Error handled
    }
  };

  /**
   * 处理驳回 (弹出输入框)
   */
  const handleReject = () => {
    let reason = '';
    Modal.confirm({
      title: '请输入驳回理由',
      content: <Input.TextArea rows={3} onChange={(e) => (reason = e.target.value)} />,
      onOk: async () => {
        if (!reason.trim()) return Promise.reject('请输入理由');
        await reject(reason);
        onClose();
      },
    });
  };

  // 是否显示操作按钮
  const showActions =
    role === 'approver' &&
    detail.status === ApprovalStatus.PENDING &&
    detail.creatorId !== userId;

  return (
    <Drawer
      title={`审批详情 - ${detail.serialNo}`}
      width={640}
      onClose={onClose}
      open={open}
      extra={
        showActions && (
          <Space>
            <Button danger onClick={handleReject} loading={isRejecting}>
              驳回
            </Button>
            <Button type="primary" onClick={handleApprove} loading={isApproving}>
              通过
            </Button>
          </Space>
        )
      }
    >
      <Descriptions column={1} bordered labelStyle={{ width: 120 }}>
        <Descriptions.Item label="项目名称">{detail.projectName}</Descriptions.Item>
        <Descriptions.Item label="申请人">{detail.creatorName}</Descriptions.Item>
        <Descriptions.Item label="归属部门">{detail.departmentPath}</Descriptions.Item>
        <Descriptions.Item label="当前状态">
          {(() => {
            const config = {
              [ApprovalStatus.APPROVED]: { color: 'success', text: '已通过', icon: <CheckCircleOutlined /> },
              [ApprovalStatus.REJECTED]: { color: 'error', text: '已驳回', icon: <CloseCircleOutlined /> },
              [ApprovalStatus.WITHDRAWN]: { color: 'default', text: '已撤回', icon: <StopOutlined /> },
              [ApprovalStatus.PENDING]: { color: 'processing', text: '待审批', icon: <ClockCircleOutlined /> },
            };
            const { color, text, icon } = config[detail.status] || { color: 'default', text: detail.status };
            return <Tag color={color} icon={icon}>{text}</Tag>;
          })()}
        </Descriptions.Item>
        <Descriptions.Item label="执行日期">{dayjs(detail.executeDate).format('YYYY-MM-DD')}</Descriptions.Item>
        <Descriptions.Item label="详细内容" className="detail-content">
          {detail.content}
        </Descriptions.Item>
      </Descriptions>

      <div className="attachments-section">
        <h3>附件列表</h3>
        {detail.attachments.length > 0 ? (
          <Space wrap>
            {detail.attachments.map((file) => {
              // Ensure path starts with / and use forward slashes
              const fileUrl = file.url || (file.path.startsWith('http') ? file.path : `/${file.path.replace(/\\/g, '/')}`);
              return file.type === 'IMAGE' ? (
                <div key={file.id} className="attachment-image-wrapper">
                  <Image width={100} height={100} src={fileUrl} className="attachment-image" />
                </div>
              ) : (
                <Button key={file.id} type="link" href={fileUrl} target="_blank">
                  📄 {file.filename}
                </Button>
              );
            })}
          </Space>
        ) : (
          <span className="no-attachments">无附件</span>
        )}
      </div>

      <div className="timeline-section">
        <h3>流转记录</h3>
        <Card size="small" variant="borderless" className="timeline-card">
          <Timeline
            items={[
              {
                color: 'green',
                children: (
                  <>
                    <p className="timeline-item-title"><strong>{detail.creatorName}</strong> 提交申请</p>
                    <span className="timeline-item-time">{dayjs(detail.createdAt).format('YYYY-MM-DD HH:mm')}</span>
                  </>
                ),
              },
              detail.approvedAt && {
                color: detail.status === ApprovalStatus.REJECTED ? 'red' : 'green',
                dot: detail.status === ApprovalStatus.REJECTED ? <CloseCircleOutlined /> : <CheckCircleOutlined />,
                children: (
                  <>
                    <p className="timeline-item-title">
                      <strong>{detail.approverName || '审批人'}</strong> {detail.status === ApprovalStatus.APPROVED ? '通过' : detail.status === ApprovalStatus.REJECTED ? '驳回' : '撤回'}
                    </p>
                    {detail.rejectReason && <div className="timeline-reject-reason">理由: {detail.rejectReason}</div>}
                    <span className="timeline-item-time">{dayjs(detail.approvedAt).format('YYYY-MM-DD HH:mm')}</span>
                  </>
                ),
              },
              detail.status === ApprovalStatus.PENDING && {
                color: 'blue',
                dot: <ClockCircleOutlined />,
                children: '等待审批中...',
              },
            ].filter(Boolean) as any[]}
          />
        </Card>
      </div>
    </Drawer>
  );
};
