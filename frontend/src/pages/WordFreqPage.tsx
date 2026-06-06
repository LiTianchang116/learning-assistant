import { useState } from 'react'
import { Card, Upload, Button, Table, Switch, InputNumber, Space, message, Typography } from 'antd'
import { InboxOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons'
import { saveAs } from 'file-saver'
import { analyzeWordFreq, exportWordFreqExcel } from '../services/api'

const { Dragger } = Upload
const { Text } = Typography

interface WordItem {
  word: string
  count: number
  frequency: number
}

export default function WordFreqPage() {
  const [files, setFiles] = useState<File[]>([])
  const [words, setWords] = useState<WordItem[]>([])
  const [useStopwords, setUseStopwords] = useState(true)
  const [minFreq, setMinFreq] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (files.length === 0) {
      message.warning('请先上传文件')
      return
    }
    setLoading(true)
    try {
      const res = await analyzeWordFreq(files, useStopwords, minFreq)
      setWords(res.words)
      message.success(`分析完成，共 ${res.total_unique} 个单词`)
    } catch (e: any) {
      message.error('分析失败: ' + (e.response?.data?.detail || e.message))
    }
    setLoading(false)
  }

  const handleExport = async () => {
    try {
      const blob = await exportWordFreqExcel(words)
      saveAs(blob, 'wordfreq_result.xlsx')
    } catch (e: any) {
      message.error('导出失败')
    }
  }

  const columns = [
    {
      title: '排名',
      key: 'rank',
      width: 70,
      render: (_: any, __: any, index: number) => index + 1,
    },
    { title: '单词', dataIndex: 'word', key: 'word', sorter: (a: WordItem, b: WordItem) => a.word.localeCompare(b.word) },
    { title: '出现次数', dataIndex: 'count', key: 'count', sorter: (a: WordItem, b: WordItem) => a.count - b.count, defaultSortOrder: 'descend' as const },
    { title: '频率(%)', dataIndex: 'frequency', key: 'frequency', sorter: (a: WordItem, b: WordItem) => a.frequency - b.frequency, render: (v: number) => v.toFixed(2) },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card title="上传文件" size="small">
        <Dragger
          multiple
          accept=".docx,.pdf,.txt"
          beforeUpload={(_, fileList) => {
            setFiles(fileList as unknown as File[])
            return false
          }}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p>支持 .docx / .pdf / .txt 批量上传</p>
        </Dragger>
        {files.length > 0 && (
          <Text type="secondary">已选择 {files.length} 个文件</Text>
        )}
      </Card>

      <Card size="small">
        <Space>
          <span>停用词过滤:</span>
          <Switch checked={useStopwords} onChange={setUseStopwords} />
          <span>最小词频:</span>
          <InputNumber min={1} value={minFreq} onChange={v => setMinFreq(v || 1)} style={{ width: 80 }} />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleAnalyze} loading={loading}>
            开始分析
          </Button>
          {words.length > 0 && (
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出 Excel
            </Button>
          )}
        </Space>
      </Card>

      {words.length > 0 && (
        <Card title={`词频统计结果 (前 ${words.length} 个高频词)`} size="small">
          <Table
            dataSource={words}
            columns={columns}
            rowKey="word"
            size="small"
            pagination={{ pageSize: 50 }}
            scroll={{ y: 500 }}
          />
        </Card>
      )}
    </div>
  )
}
