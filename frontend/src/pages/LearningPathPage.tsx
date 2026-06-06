import { useState } from 'react'
import { Card, Input, Button, Timeline, Typography, Space, message } from 'antd'
import { RocketOutlined, BookOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { generateLearningPath } from '../services/api'

const { TextArea } = Input
const { Title, Text, Paragraph } = Typography

interface Stage {
  title: string
  duration: string
  resources: string[]
  description: string
}

export default function LearningPathPage() {
  const [subject, setSubject] = useState('')
  const [level, setLevel] = useState('')
  const [goal, setGoal] = useState('')
  const [timeAvailable, setTimeAvailable] = useState('')
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!subject.trim()) {
      message.warning('请输入想学的科目或方向')
      return
    }
    setLoading(true)
    try {
      const res = await generateLearningPath(subject, level, goal, timeAvailable)
      if (res.error) {
        message.error(res.error)
        return
      }
      setStages(res.stages || [])
      if (res.stages?.length === 0) {
        message.warning('未能生成学习路径，请重试')
      }
    } catch (e: any) {
      message.error('生成失败: ' + (e.response?.data?.detail || e.message))
    }
    setLoading(false)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ width: 320 }}>
        <Card title="学习需求" size="small">
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>想学的科目/方向 *</Text>
              <TextArea
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="例如：Python机器学习"
                autoSize={{ minRows: 1, maxRows: 2 }}
                style={{ marginTop: 4 }}
              />
            </div>
            <div>
              <Text strong>当前水平</Text>
              <TextArea
                value={level}
                onChange={e => setLevel(e.target.value)}
                placeholder="例如：有Python基础，了解基本统计"
                autoSize={{ minRows: 1, maxRows: 2 }}
                style={{ marginTop: 4 }}
              />
            </div>
            <div>
              <Text strong>学习目标</Text>
              <TextArea
                value={goal}
                onChange={e => setGoal(e.target.value)}
                placeholder="例如：能独立完成Kaggle竞赛"
                autoSize={{ minRows: 1, maxRows: 2 }}
                style={{ marginTop: 4 }}
              />
            </div>
            <div>
              <Text strong>可用学习时间</Text>
              <TextArea
                value={timeAvailable}
                onChange={e => setTimeAvailable(e.target.value)}
                placeholder="例如：每天2小时，共3个月"
                autoSize={{ minRows: 1, maxRows: 2 }}
                style={{ marginTop: 4 }}
              />
            </div>
            <Button type="primary" icon={<RocketOutlined />} block onClick={handleGenerate} loading={loading}>
              生成学习路径
            </Button>
          </Space>
        </Card>
      </div>

      <div style={{ flex: 1 }}>
        {stages.length > 0 ? (
          <Card
            title="学习路径规划"
            size="small"
            extra={<Button onClick={handlePrint}>打印/导出PDF</Button>}
          >
            <Timeline
              items={stages.map((stage, i) => ({
                color: ['blue', 'green', 'orange', 'purple', 'red'][i % 5],
                children: (
                  <Card size="small" style={{ marginBottom: 0 }}>
                    <Title level={4} style={{ marginTop: 0 }}>
                      阶段 {i + 1}: {stage.title}
                    </Title>
                    <Space>
                      <ClockCircleOutlined />
                      <Text type="secondary">{stage.duration}</Text>
                    </Space>
                    <Paragraph style={{ marginTop: 8 }}>{stage.description}</Paragraph>
                    {stage.resources?.length > 0 && (
                      <div>
                        <Text strong><BookOutlined /> 推荐资源:</Text>
                        <ul style={{ marginTop: 4 }}>
                          {stage.resources.map((r, j) => (
                            <li key={j}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                ),
              }))}
            />
          </Card>
        ) : (
          <Card style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text type="secondary">填写学习需求后点击"生成学习路径"</Text>
          </Card>
        )}
      </div>
    </div>
  )
}
