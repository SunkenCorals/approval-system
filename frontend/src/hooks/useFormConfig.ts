import { useState, useEffect } from 'react';
import { FormConfigField } from '@/types';
import { approvalApi } from '@/api/approval';

/**
 * Hook: useFormConfig
 * 职责: 负责获取并缓存动态表单的配置信息
 * @param key 表单配置的 Key，如 'approvalForm'
 */
export const useFormConfig = (key: string) => {
  const [fields, setFields] = useState<FormConfigField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const data = await approvalApi.getFormConfig(key);
        setFields(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (key) {
      fetchConfig();
    }
  }, [key]);

  return { fields, loading, error };
};
