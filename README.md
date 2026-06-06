# 全能学习助手

一个集成多种学习工具的 Web 应用，基于 React + FastAPI + MIMO 大模型。

## 功能

| 功能 | 说明 | 大模型 |
|------|------|--------|
| 格式修改 | 通过自然语言修改 Word 文档格式 | MIMO (Function Calling) |
| 词频分析 | 英文文档词频统计，支持导出 Excel | 不需要 |
| 思维导图 | 从文本/文档提取知识点生成思维导图 | MIMO |
| 学习路径 | AI 生成个性化学习路径规划 | MIMO |

## 环境要求

- Python 3.10+
- Node.js 18+
- MIMO API Key

## 快速启动

### 1. 配置环境变量

```powershell
# Windows PowerShell
$env:MIMO_API_KEY="你的MIMO API密钥"
```

或在 `backend/` 目录下创建 `.env` 文件：
```
MIMO_API_KEY=你的MIMO API密钥
```

### 2. 启动后端

```bash
cd backend
pip install -r requirements.txt
python main.py
```

后端运行在 http://localhost:8000

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在 http://localhost:5173

## 项目结构

```
learning-assistant/
├── backend/
│   ├── main.py              # FastAPI 入口
│   ├── config.py            # 配置
│   ├── memory.py            # 对话记忆管理
│   ├── cleanup.py           # 临时文件清理
│   ├── requirements.txt     # Python 依赖
│   ├── routes/              # API 路由
│   │   ├── format_routes.py
│   │   ├── wordfreq_routes.py
│   │   ├── mindmap_routes.py
│   │   └── learning_routes.py
│   ├── services/            # 业务逻辑
│   │   ├── llm_client.py
│   │   ├── format_service.py
│   │   ├── wordfreq_service.py
│   │   ├── mindmap_service.py
│   │   └── learning_service.py
│   └── tools/               # 工具函数
│       └── docx_tools.py
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── pages/
│       │   ├── FormatPage.tsx
│       │   ├── WordFreqPage.tsx
│       │   ├── MindMapPage.tsx
│       │   └── LearningPathPage.tsx
│       ├── services/
│       │   └── api.ts
│       └── utils/
│           └── session.ts
└── README.md
```

## 技术栈

### 前端
- React 18 + TypeScript
- Ant Design 5 (中文 UI)
- react-router-dom (路由)
- mammoth.js (Word 文档预览)
- markmap (思维导图渲染)
- xlsx (Excel 导出)
- Vite (构建工具)

### 后端
- FastAPI (异步 API)
- python-docx (Word 文档操作)
- pdfplumber (PDF 文本提取)
- anthropic SDK (MIMO 调用)
- openpyxl (Excel 生成)

## 对话记忆机制

- 每个用户会话生成唯一 session_id (UUID)，存入浏览器 localStorage
- 所有请求自动携带 session_id
- 后端按 session_id + 功能名 独立维护对话历史
- 每次请求自动带上最近 10 轮对话作为上下文
- 临时文件 1 小时后自动清理

## 注意事项

- 文件大小限制: 10MB
- 仅支持 .docx 格式的格式修改
- 词频分析支持 .docx / .pdf / .txt
- 思维导图支持 .docx / .txt
- 所有 API 调用使用 MIMO 端点 (platform.xiaomimimo.com)
