import React, { useState, useEffect } from 'react';
import { Form, Button, Upload, message, Card, Space, Spin } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { DynamicForm } from '@/components/DynamicForm';
import { approvalApi } from '@/api/approval';
import { useFormConfig } from '@/hooks';
import dayjs from 'dayjs';
import '@/styles/ApprovalForm.css';

/**
 * 页面: ApprovalFormPage
 * 职责: 处理审批单的新建与编辑逻辑
 */
export const ApprovalFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // 使用自定义 Hook 获取表单配置
  const { fields, loading: configLoading } = useFormConfig('approvalForm');
  const [fileList, setFileList] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Effect: 初始化编辑数据
   * 依赖: [id, form]
   */
  useEffect(() => {
    if (id) {
      const loadDetail = async () => {
        try {
          const detail = await approvalApi.getDetail(Number(id));
          form.setFieldsValue({
            ...detail,
            executeDate: dayjs(detail.executeDate),
            departmentIds: detail.departmentIds,
          });
          // 初始化附件列表
          if (detail.attachments) {
            setFileList(detail.attachments.map(f => ({
              uid: f.id,
              name: f.filename,
              status: 'done',
              url: f.url || f.path, // 实际项目中应处理 URL
            })));
          }
        } catch (error) {
          message.error('加载详情失败');
          navigate('/approval');
        }
      };
      loadDetail();
    }
  }, [id, form, navigate]);

  /**
   * 提交表单
   */
  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);
      const payload = {
        ...values,
        executeDate: values.executeDate.format('YYYY-MM-DD'),
      };

      let approvalId = Number(id);
      if (id) {
        await approvalApi.update(approvalId, payload);
        message.success('修改成功');
      } else {
        const res = await approvalApi.create(payload);
        approvalId = res.id;
        message.success('创建成功');
      }

      // 处理新上传的文件 (uid 为非数字或手动标记的)
      const newFiles = fileList.filter(f => f.originFileObj);
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((file) => formData.append('files', file.originFileObj));
        await approvalApi.upload(approvalId, formData);
      }

      navigate('/');
    } catch (error) {
      // 错误已由拦截器处理
    } finally {
      setSubmitting(false);
    }
  };

  if (configLoading) {
    return <Spin size="large" className="loading-spin" />;
  }

  return (
    <div className="page-container">
      <Card 
        title={
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              type="text" 
              onClick={() => navigate(-1)} 
            />
            {id ? '编辑审批单' : '新建审批单'}
          </Space>
        }
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish}
          disabled={submitting}
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

          <Form.Item className="page-footer">
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                提交
              </Button>
              <Button onClick={() => navigate('/')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
