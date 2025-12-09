import React from 'react';
import { Cascader } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { approvalApi } from '@/api/approval';
import '@/styles/components.css';

interface DepartmentSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  loading?: boolean;
}

/**
 * 组件: DepartmentSelect
 * 职责: 封装部门级联选择逻辑，内部直接获取数据
 */
export const DepartmentSelect: React.FC<DepartmentSelectProps> = ({
  value,
  onChange,
  loading: propLoading,
}) => {
  const { data: departmentTree = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: approvalApi.getDepartments,
    initialData: [],
  });

  return (
    <Cascader
      options={departmentTree}
      value={value}
      onChange={(val) => onChange?.(val as string[])}
      placeholder="请选择部门"
      loading={propLoading || isLoading}
      changeOnSelect
      className="full-width"
    />
  );
};
