# Click-to-Read English Text

一个基于React + TypeScript + Tailwind CSS的英语学习应用，支持点击单词朗读和字典查询功能。

## 功能特性

### 🎵 语音朗读
- **智能语音选择** - 优先选择Microsoft Edge和Windows高质量语音引擎
- **单词朗读** - 点击任意单词即可朗读
- **全文朗读** - 按句子分段朗读，避免长文本限制
- **快捷键支持** - 按空格键快速朗读当前句子
- **语速调节** - 支持0.5x到2x语速调节
- **语音测试** - 测试所选语音效果

### 📖 字典功能
- **在线词典** - 优先使用免费的Dictionary API获取完整释义
- **离线备份** - 内置常用词汇，网络失败时自动切换
- **详细信息** - 显示音标、词性、释义和例句
- **美观弹窗** - 现代化设计的字典弹窗

### ✨ 用户体验
- **响应式设计** - 适配不同屏幕尺寸
- **现代UI** - 使用Tailwind CSS构建的美观界面
- **TypeScript** - 完整的类型安全
- **模块化架构** - 清晰的代码结构，易于维护

### 🎤 默写模式
- **打字练习** - 逐句输入英文文本进行默写练习
- **实时反馈** - 显示输入进度和正确性
- **进度保存** - 自动保存练习进度到本地存储
- **智能提示** - 自动空格和单词匹配

### 🗣️ 朗读模式
- **语音识别** - 使用Web Speech API进行语音转文字
- **朗读练习** - 通过说话来练习英语发音和朗读
- **实时转录** - 实时显示语音识别结果
- **进度跟踪** - 跟踪朗读准确度和完成度

## 技术栈

- **React 19** - 前端框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 原子化CSS框架
- **Vite** - 构建工具
- **Web Speech API** - 浏览器语音合成
- **Dictionary API** - 免费在线词典服务

## 快速开始

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build
```

### 预览生产版本
```bash
pnpm preview
```

## 使用说明

1. **文本输入** - 在顶部文本框输入英文文本
2. **语音设置** - 选择合适的语音引擎和语速
3. **转换文本** - 点击"转换文本"按钮将文本转换为可点击格式
4. **单词朗读** - 点击任意单词进行朗读和查看释义
5. **全文朗读** - 使用"全文朗读"功能朗读整篇文章
6. **默写模式** - 点击"默写模式"按钮进行打字练习
7. **朗读模式** - 点击"朗读模式"按钮进行语音朗读练习

## 浏览器支持

- ✅ Chrome/Chromium (推荐)
- ✅ Microsoft Edge (推荐)
- ✅ Firefox
- ✅ Safari
- ❌ Internet Explorer

## 项目结构

```
src/
├── components/          # React组件
│   └── DictionaryPopup.tsx
├── hooks/              # 自定义Hooks
│   ├── useDictionary.ts
│   └── useSpeech.ts
├── data/               # 数据文件
│   └── offlineDictionary.ts
├── types/              # TypeScript类型定义
│   └── index.ts
├── App.tsx             # 主应用组件
├── main.tsx           # 应用入口
└── index.css          # Tailwind CSS样式
```

## 开发说明

### 添加新词汇到离线词典

编辑 `src/data/offlineDictionary.ts` 文件：

```typescript
export const offlineDictionary: Record<string, DictionaryEntry> = {
  'newword': {
    phonetic: '/njuːwɜːrd/',
    meanings: [
      { 
        partOfSpeech: 'noun', 
        definition: 'A word that has been recently created.',
        example: 'This is a newword in our dictionary.'
      }
    ]
  },
  // ... 其他词汇
};
```

### 自定义样式

项目使用Tailwind CSS，可以直接在组件中使用工具类，或在 `tailwind.config.js` 中自定义配置。

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！
