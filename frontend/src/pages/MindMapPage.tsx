import { useState, useRef, useEffect } from 'react'
import { Card, Upload, Button, Input, message, Typography, Tabs } from 'antd'
import { InboxOutlined, ReloadOutlined, EditOutlined, DownloadOutlined } from '@ant-design/icons'
import { generateMindmap, regenerateMindmap } from '../services/api'

const { Dragger } = Upload
const { TextArea } = Input
const { Text } = Typography

declare global {
  interface Window {
    markmap: any
    markmapLib: any
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}

async function loadMarkmap() {
  await loadScript('https://cdn.jsdelivr.net/npm/d3@7')
  await loadScript('https://cdn.jsdelivr.net/npm/markmap-view@0.15.4/dist/browser/index.js')
  await loadScript('https://cdn.jsdelivr.net/npm/markmap-lib@0.15.4/dist/browser/index.js')
}

export default function MindMapPage() {
  const [mode, setMode] = useState<'text' | 'file'>('text')
  const [textInput, setTextInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [markdown, setMarkdown] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [libReady, setLibReady] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const mmRef = useRef<any>(null)

  useEffect(() => {
    loadMarkmap().then(() => setLibReady(true)).catch(() => message.error('加载markmap失败'))
  }, [])

  useEffect(() => {
    if (markdown && svgRef.current && !editMode && libReady) {
      renderMarkmap(markdown)
    }
  }, [markdown, editMode, libReady])

  const renderMarkmap = (md: string) => {
    if (!svgRef.current || !window.markmapLib || !window.markmap) return
    const { Transformer } = window.markmapLib
    const { Markmap } = window.markmap
    const transformer = new Transformer()
    const { root } = transformer.transform(md)
    svgRef.current.innerHTML = ''
    mmRef.current = Markmap.create(svgRef.current)
    mmRef.current.setData(root)
    mmRef.current.fit()
  }

  const handleGenerate = async () => {
    if (mode === 'text' && !textInput.trim()) { message.warning('请输入文本'); return }
    if (mode === 'file' && !file) { message.warning('请上传文件'); return }
    setLoading(true)
    try {
      const res = await generateMindmap(mode === 'text' ? textInput : undefined, mode === 'file' ? file! : undefined)
      let md = res.markdown
      if (md.startsWith('```')) md = md.replace(/^```(?:markdown)?\n?/, '').replace(/\n?```$/, '')
      setMarkdown(md)
      setEditMode(false)
    } catch (e: any) {
      message.error('生成失败: ' + (e.response?.data?.detail || e.message))
    }
    setLoading(false)
  }

  const handleRegenerate = async () => {
    if (!feedback.trim()) { message.warning('请输入修改意见'); return }
    setLoading(true)
    try {
      const res = await regenerateMindmap(markdown, feedback)
      let md = res.markdown
      if (md.startsWith('```')) md = md.replace(/^```(?:markdown)?\n?/, '').replace(/\n?```$/, '')
      setMarkdown(md)
      setFeedback('')
      setEditMode(false)
    } catch (e: any) {
      message.error('重新生成失败: ' + (e.response?.data?.detail || e.message))
    }
    setLoading(false)
  }

  const handleExportSVG = () => {
    if (!svgRef.current) return
    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'mindmap.svg'; a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPNG = () => {
    if (!svgRef.current) return
    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url; a.download = 'mindmap.png'; a.click()
          URL.revokeObjectURL(url)
        }
      })
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 48px)' }}>
      <div style={{ width: 350, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card title="输入内容" size="small">
          <Tabs activeKey={mode} onChange={k => setMode(k as any)} items={[
            { key: 'text', label: '输入文本', children: (
              <TextArea value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="粘贴或输入要分析的文本内容..." autoSize={{ minRows: 6, maxRows: 12 }} />
            )},
            { key: 'file', label: '上传文档', children: (
              <Dragger accept=".docx,.txt" beforeUpload={f => { setFile(f); return false }} showUploadList={false}>
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p>上传 .docx 或 .txt 文件</p>
              </Dragger>
            )},
          ]} />
          <Button type="primary" block style={{ marginTop: 12 }} onClick={handleGenerate} loading={loading}>
            生成导图
          </Button>
        </Card>

        {markdown && (
          <Card title="操作" size="small">
            <Button icon={<EditOutlined />} block style={{ marginBottom: 8 }} onClick={() => setEditMode(!editMode)}>
              {editMode ? '查看导图' : '编辑 Markdown'}
            </Button>
            <Button icon={<DownloadOutlined />} block style={{ marginBottom: 8 }} onClick={handleExportSVG}>导出 SVG</Button>
            <Button icon={<DownloadOutlined />} block onClick={handleExportPNG}>导出 PNG</Button>
          </Card>
        )}

        {markdown && (
          <Card title="重新生成" size="small">
            <TextArea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="输入修改意见..." autoSize={{ minRows: 2, maxRows: 4 }} />
            <Button icon={<ReloadOutlined />} block style={{ marginTop: 8 }} onClick={handleRegenerate} loading={loading}>重新生成</Button>
          </Card>
        )}
      </div>

      <Card style={{ flex: 1 }} bodyStyle={{ height: '100%', padding: 0 }}>
        {markdown ? (
          editMode ? (
            <TextArea value={markdown} onChange={e => setMarkdown(e.target.value)} style={{ height: '100%', fontFamily: 'monospace', fontSize: 14, border: 'none', resize: 'none' }} />
          ) : (
            <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
          )
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
            {!libReady ? '加载思维导图组件中...' : '输入文本或上传文件后点击"生成导图"'}
          </div>
        )}
      </Card>
    </div>
  )
}
