import React, { useState } from 'react';
import { message } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { approvalApi } from '@/api/approval';
import { ApprovalDetailDrawer } from '@/pages/ApprovalDetail';
import { ApprovalFormModal } from '@/pages/ApprovalFormModal';
import { ApprovalFilter } from './components/ApprovalFilter';
import { ApprovalTable } from './components/ApprovalTable';

/**
 * 页面: ApprovalList
 * 职责: 审批列表页的主容器，负责状态管理与组件组合
 * 
 * 包含以下部分:
 * 1. ApprovalFilter: 顶部筛选区
 * 2. ApprovalTable: 数据列表区
 * 3. ApprovalDetailDrawer: 详情抽屉
 * 4. ApprovalFormModal: 新建/编辑弹窗
 */
export const ApprovalList: React.FC = () => {
  // 模拟角色切换
  const [role, setRole] = useState<'applicant' | 'approver'>('applicant');
  const [userId, setUserId] = useState(role === 'applicant' ? 'u1' : 'a1');

  // Effect: 切换角色时同步更新请求头 (模拟身份切换)
  React.useEffect(() => {
    setUserId(role === 'applicant' ? 'u1' : 'a1');
    import('@/api/request').then(({ default: req }) => {
      req.defaults.headers.common['X-User-Role'] = role;
      req.defaults.headers.common['X-User-Id'] = userId;
    });
  }, [role, userId]);

  // 分页与筛选状态
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useState<any>({});
  
  // 弹窗与抽屉状态
  const [detailId, setDetailId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // React Query: 获取列表数据
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['approvals', page, pageSize, searchParams, role],
    queryFn: () =>
      approvalApi.getList({
        page,
        pageSize,
        ...searchParams,
      }),
  });

  // React Query: 获取详情数据 (用于 Drawer)
  const { data: detailData } = useQuery({
    queryKey: ['approval', detailId],
    queryFn: () => (detailId ? approvalApi.getDetail(detailId) : Promise.resolve(null)),
    enabled: !!detailId,
  });

  /**
   * 处理搜索提交
   * 将表单的 Moment 对象转换为 ISO 字符串
   */
  const handleSearch = (values: any) => {
    const params: any = { ...values };
    if (values.createdRange) {
      params.createdStart = values.createdRange[0].toISOString();
      params.createdEnd = values.createdRange[1].toISOString();
      delete params.createdRange;
    }
    setSearchParams(params);
    setPage(1); // 重置到第一页
  };

  /**
   * 撤回操作
   */
  const handleWithdraw = async (id: number) => {
    try {
      await approvalApi.withdraw(id);
      message.success('撤回成功');
      refetch();
    } catch (e) {
      // Error handled by interceptor
    }
  };

  /**
   * 打开新建弹窗
   */
  const handleCreate = () => {
    setEditId(null);
    setIsModalOpen(true);
  };

  /**
   * 打开编辑弹窗
   */
  const handleEdit = (id: number) => {
    setEditId(id);
    setIsModalOpen(true);
  };

  /**
   * 表单提交成功回调 (关闭弹窗并刷新列表)
   */
  const handleFormSuccess = () => {
    setIsModalOpen(false);
    refetch();
  };

  /**
   * 分页切换回调
   */
  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  return (
    <div>
      {/* 筛选区域 */}
      <ApprovalFilter
        role={role}
        onRoleChange={setRole}
        onSearch={handleSearch}
        onCreate={handleCreate}
        loading={isLoading}
      />

      {/* 表格区域 */}
      <ApprovalTable
        data={data}
        loading={isLoading}
        page={page}
        pageSize={pageSize}
        role={role}
        onPageChange={handlePageChange}
        onView={setDetailId}
        onEdit={handleEdit}
        onWithdraw={handleWithdraw}
      />

      {/* 详情抽屉 */}
      <ApprovalDetailDrawer
        open={!!detailId}
        onClose={() => setDetailId(null)}
        detail={detailData || null}
        role={role}
        userId={userId}
      />

      {/* 新建/编辑弹窗 */}
      <ApprovalFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleFormSuccess}
        editId={editId}
      />
    </div>
  );
};
