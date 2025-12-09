import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalApi } from '@/api/approval';
import { message } from 'antd';

/**
 * Hook: useApprovalDetail
 * 职责: 管理审批单详情的获取与操作（审批、驳回、撤回）
 * @param id 审批单 ID
 */
export const useApprovalDetail = (id?: number) => {
  const queryClient = useQueryClient();

  // 获取详情
  const { data: detail, isLoading, refetch } = useQuery({
    queryKey: ['approval', id],
    queryFn: () => (id ? approvalApi.getDetail(id) : Promise.resolve(null)),
    enabled: !!id,
  });

  // 审批通过 Mutation
  const approveMutation = useMutation({
    mutationFn: () => approvalApi.approve(id!),
    onSuccess: () => {
      message.success('审批已通过');
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approval', id] });
    },
  });

  // 驳回 Mutation
  const rejectMutation = useMutation({
    mutationFn: (reason: string) => approvalApi.reject(id!, reason),
    onSuccess: () => {
      message.success('审批已驳回');
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approval', id] });
    },
  });

  // 撤回 Mutation
  const withdrawMutation = useMutation({
    mutationFn: () => approvalApi.withdraw(id!),
    onSuccess: () => {
      message.success('审批已撤回');
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approval', id] });
    },
  });

  return {
    detail,
    isLoading,
    refetch,
    approve: approveMutation.mutateAsync,
    reject: rejectMutation.mutateAsync,
    withdraw: withdrawMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isWithdrawing: withdrawMutation.isPending,
  };
};
