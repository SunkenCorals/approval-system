import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Upload, message, Space, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { DynamicForm } from '@/components/DynamicForm';
import { approvalApi } from '@/api/approval';
import { useFormConfig } from '@/hooks';
import dayjs from 'dayjs';
import '@/styles/ApprovalForm.css';

interface ApprovalFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editId?: number | null;
}

/**
 * 组件: ApprovalFormModal
 * 职责: 弹窗形式处理审批单的新建与编辑逻辑
 */
export const ApprovalFormModal: React.FC<ApprovalFormModalProps> = ({
  open,
  onClose,
  onSuccess,
  editId,
}) => {
  const [form] = Form.useForm();
  const { fields, loading: configLoading } = useFormConfig('approvalForm');
  const [fileList, setFileList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  /**
   * Effect: 初始化/重置表单
   */
  useEffect(() => {
    if (open) {
      form.resetFields();
      setFileList([]);
      
      if (editId) {
        setLoadingDetail(true);
        approvalApi.getDetail(editId)
          .then((detail) => {
            form.setFieldsValue({
              ...detail,
              executeDate: dayjs(detail.executeDate),
              departmentIds: detail.departmentIds,
            });
            if (detail.attachments) {
              setFileList(detail.attachments.map(f => ({
                uid: f.id,
                name: f.filename,
                status: 'done',
                url: f.url || f.path,
              })));
            }
          })
          .catch(() => {
            message.error('加载详情失败');
            onClose();
          })
          .finally(() => {
            setLoadingDetail(false);
          });
      }
    }
  }, [open, editId, form]);

  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);
      const payload = {
        ...values,
        executeDate: values.executeDate.format('YYYY-MM-DD'),
      };

      let approvalId = editId;
      if (editId) {
        await approvalApi.update(editId, payload);
        message.success('修改成功');
      } else {
        const res = await approvalApi.create(payload);
        approvalId = res.id;
        message.success('创建成功');
      }

      // 处理新上传的文件
      const newFiles = fileList.filter(f => f.originFileObj);
      if (newFiles.length > 0 && approvalId) {
        const formData = new FormData();
        newFiles.forEach((file) => formData.append('files', file.originFileObj));
        await approvalApi.upload(approvalId, formData);
      }

      onSuccess();
    } catch (error) {
      // 错误已由拦截器处理
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={editId ? '编辑审批单' : '新建审批单'}
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      destroyOnClose
      maskClosable={false}
    >
      <Spin spinning={configLoading || loadingDetail}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          disabled={submitting}
          className="form-container"
        >
          <DynamicForm fields={fields} loading={configLoading} />

          <Form.Item label="附件">
            <Upload
              beforeUpload={() => false}
              onChange={(info) => setFileList(info.fileList)}
              fileList={fileList}
              maxCount={6}
              accept=".jpg,.jpeg,.png,.xls,.xlsx"
            >
              <Button icon={<UploadOutlined />}>上传图片/Excel</Button>
            </Upload>
            <div className="upload-hint">
              支持图片(max 5)与Excel(max 1)，单个文件不超过 10MB
            </div>
          </Form.Item>

          <Form.Item className="form-footer">
            <Space>
              <Button onClick={onClose}>取消</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                提交
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};
