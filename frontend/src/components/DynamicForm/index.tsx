import React from 'react';
import { Form, Input, DatePicker } from 'antd';
import { DepartmentSelect } from '../DepartmentSelect';
import { FormConfigField } from '@/types';
import { Rule } from 'antd/es/form';
import '@/styles/components.css';

interface DynamicFormProps {
  fields: FormConfigField[];
  loading?: boolean;
}

/**
 * 组件: DynamicForm
 * 职责: 根据后端 Schema 动态渲染表单项
 */
export const DynamicForm: React.FC<DynamicFormProps> = ({ fields, loading }) => {
  /**
   * 转换校验规则: Backend Validator -> Antd Rules
   */
  const getRules = (field: FormConfigField): Rule[] => {
    const rules: Rule[] = [];
    if (field.validator.required) {
      rules.push({ required: true, message: `${field.name} is required` });
    }
    if (field.validator.maxCount) {
      rules.push({ max: field.validator.maxCount, message: `Max length is ${field.validator.maxCount}` });
    }
    return rules;
  };

  /**
   * 渲染组件工厂函数
   */
  const renderComponent = (field: FormConfigField) => {
    switch (field.component) {
      case 'Input':
        return <Input placeholder={`请输入${field.name}`} />;
      case 'Textarea':
        return <Input.TextArea rows={4} placeholder={`请输入${field.name}`} />;
      case 'DatePicker':
        return <DatePicker className="full-width" />;
      case 'DepartmentSelect':
        // DepartmentSelect 内部已接管 loading 和数据获取
        return <DepartmentSelect loading={loading} />;
      default:
        return <Input />;
    }
  };

  return (
    <>
      {fields.map((field) => (
        <Form.Item
          key={field.field}
          name={field.field}
          label={field.name}
          rules={getRules(field)}
        >
          {renderComponent(field)}
        </Form.Item>
      ))}
    </>
  );
};
