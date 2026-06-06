import { useState, useRef } from 'react'
import { Card, Upload, Button, Input, message, Space, Typography, List } from 'antd'
import { InboxOutlined, DownloadOutlined, SendOutlined } from '@ant-design/icons'
import mammoth from 'mammoth'
import { saveAs } from 'file-saver'
import { uploadFormatFiles, modifyDocuments, getDownloadUrl } from '../services/api'

const { Dragger } = Upload
const { TextArea } = Input
const { Title, Text } = Typography

export default function FormatPage() {
  const [files, setFiles] = useState<File[]>([])
  const [filePaths, setFilePaths] = useState<string[]>([])
  const [preview, setPreview] = useState<string>('')
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [downloadInfo, setDownloadInfo] = useState<{ path: string; name: string } | null>(null)

  const handleUpload = async (fileList: File[]) => {
    setFiles(fileList)
    // Preview first file
    if (fileList[0]) {
      const arrayBuffer = await fileList[0].arrayBuffer()
      const result = await mammoth.convertToHtml({ arrayBuffer })
      setPreview(result.value)
    }
    // Upload to server
    try {
      const res = await uploadFormatFiles(fileList)
      setFilePaths(res.files.map((f: any) => f.path))
      message.success(`已上传 ${fileList.length} 个文件`)
    } catch (e: any) {
      message.error('上传失败: ' + (e.response?.data?.detail || e.message))
    }
  }

  const handleSend = async () => {
    if (!input.trim() || filePaths.length === 0) return
    const userMsg = input.trim()
    setInput('')
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const res = await modifyDocuments(filePaths, userMsg)
      const summary = Object.entries(res.summaries || {})
        .map(([name, s]) => `**${name}**: ${s}`)
        .join('\n')
      setChatHistory(prev => [...prev, { role: 'assistant', content: summary || '修改完成' }])
      setDownloadInfo({ path: res.download_path, name: res.filename })
    } catch (e: any) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: '错误: ' + (e.response?.data?.detail || e.message) }])
    }
    setLoading(false)
  }

  const handleDownload = () => {
    if (downloadInfo) {
      saveAs(getDownloadUrl(downloadInfo.name), downloadInfo.name)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 48px)' }}>
      {/* Left: File area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card title="上传文档" size="small">
          <Dragger
            multiple
            accept=".docx"
            beforeUpload={(file, fileList) => {
              handleUpload(fileList as unknown as File[])
              return false
            }}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p>点击或拖拽 .docx 文件到此处上传（支持批量）</p>
          </Dragger>
          {files.length > 0 && (
            <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
              已选择 {files.length} 个文件: {files.map(f => f.name).join(', ')}
            </Text>
          )}
        </Card>

        <Card title="文档预览" size="small" style={{ flex: 1, overflow: 'auto' }}>
          {preview ? (
            <div dangerouslySetInnerHTML={{ __html: preview }} style={{ padding: 16, border: '1px solid #eee', borderRadius: 4, background: '#fff' }} />
          ) : (
            <Text type="secondary">上传文档后可预览内容</Text>
          )}
        </Card>

        {downloadInfo && (
          <Button type="primary" icon={<DownloadOutlined />} size="large" block onClick={handleDownload}>
            下载修改后的文件
          </Button>
        )}
      </div>

      {/* Right: Chat */}
      <Card title="格式修改对话" style={{ width: 400, display: 'flex', flexDirection: 'column' }}
        bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflow: 'auto', marginBottom: 12 }}>
          {chatHistory.length === 0 && (
            <Text type="secondary">输入修改指令，例如："把所有正文改为小四号宋体"</Text>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} style={{
              marginBottom: 8,
              padding: '8px 12px',
              borderRadius: 8,
              background: msg.role === 'user' ? '#1890ff' : '#f5f5f5',
              color: msg.role === 'user' ? '#fff' : '#333',
              textAlign: msg.role === 'user' ? 'right' : 'left',
            }}>
              {msg.content}
            </div>
          ))}
        </div>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="输入格式修改指令..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); handleSend() } }}
            disabled={loading}
          />
          <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading} />
        </Space.Compact>
      </Card>
    </div>
  )
}
