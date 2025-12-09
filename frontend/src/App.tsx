import React from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { ApprovalList } from '@/pages/ApprovalList';
import { Layout, Menu, Typography, ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import zhCN from 'antd/locale/zh_CN';
import '@/styles/global.css';

const { Header, Content } = Layout;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
            fontSize: 14,
            colorPrimary: '#1677ff', // 使用 Ant Design 默认的蓝色，通常更协调
            borderRadius: 8,
          },
          components: {
            Layout: {
              headerBg: '#ffffff',
              bodyBg: '#f0f2f5', // 更标准的背景色
            },
            Card: {
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
            }
          },
        }}
      >
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Layout className="layout">
            <Header className="header">
              <div className="header-logo">
                <div className="logo-icon">
                  A
                </div>
                <Typography.Title level={4} className="header-title">
                  企业审批系统
                </Typography.Title>
              </div>
              <Menu
                mode="horizontal"
                defaultSelectedKeys={['approval']}
                items={[{ key: 'approval', label: '审批中心' }]}
                className="header-menu"
              />
            </Header>
            <Content className="content">
              <div className="content-inner">
                <Routes>
                  <Route path="/" element={<Navigate to="/approval" replace />} />
                  <Route path="/approval" element={<ApprovalList />} />
                </Routes>
              </div>
            </Content>
          </Layout>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

export default App;
