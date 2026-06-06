import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import {
  FileWordOutlined,
  BarChartOutlined,
  BranchesOutlined,
  RocketOutlined,
} from '@ant-design/icons'

import FormatPage from './pages/FormatPage'
import WordFreqPage from './pages/WordFreqPage'
import MindMapPage from './pages/MindMapPage'
import LearningPathPage from './pages/LearningPathPage'

const { Sider, Content } = Layout

const menuItems = [
  { key: '/format', icon: <FileWordOutlined />, label: '格式修改' },
  { key: '/wordfreq', icon: <BarChartOutlined />, label: '词频分析' },
  { key: '/mindmap', icon: <BranchesOutlined />, label: '思维导图' },
  { key: '/learning-path', icon: <RocketOutlined />, label: '学习路径' },
]

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={200}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          overflow: 'auto',
        }}
      >
        <div style={{ padding: '20px 16px', fontWeight: 700, fontSize: 18, textAlign: 'center' }}>
          全能学习助手
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ marginLeft: 200 }}>
        <Content style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
          <Routes>
            <Route path="/format" element={<FormatPage />} />
            <Route path="/wordfreq" element={<WordFreqPage />} />
            <Route path="/mindmap" element={<MindMapPage />} />
            <Route path="/learning-path" element={<LearningPathPage />} />
            <Route path="*" element={<FormatPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}
