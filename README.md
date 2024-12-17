# WeChat Bot Manager

一个基于 Electron + Vue3 + TypeScript 开发的微信机器人管理工具。

## 功能特点

- 🤖 微信机器人登录管理
- 💬 消息记录查看
- 👥 联系人和群组管理
- 🔄 自动回复功能
  - 支持多关键词触发
  - 支持模糊/精确匹配
  - 支持群聊@回复
  - 支持启用/禁用规则
- 📊 数据统计面板

## 技术栈

- Electron
- Vue 3
- TypeScript
- Wechaty
- Electron Store

## 开发环境要求

- Node.js >= 16
- npm >= 8

## 安装和运行

```bash
# 克隆项目
git clone https://github.com/yourusername/wechat-bot-manager.git

# 进入项目目录
cd wechat-bot-manager

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 打包应用
# For windows
npm run build:win

# For macOS
npm run build:mac

# For Linux
npm run build:linux
```

## 使用说明

1. 登录功能

   - 扫描二维码登录
   - 支持自动重连
   - 显示登录状态

2. 消息管理

   - 实时显示消息记录
   - 支持消息搜索
   - 显示群聊和私聊消息

3. 联系人管理

   - 查看好友列表
   - 查看群聊列表
   - 支持手动刷新

4. 自动回复
   - 添加多个关键词
   - 设置匹配模式
   - 群聊中需要@机器人才会触发
   - 可随时启用/禁用规则

## 项目结构

```
src/
├── main/              # Electron 主进程
│   ├── bot/          # 机器人核心逻辑
│   └── store/        # 数据持久化
├── renderer/         # 渲染进程（Vue应用）
│   └── src/
│       ├── components/  # Vue组件
│       └── assets/     # 静态资源
├── preload/         # 预加载脚本
└── types/           # TypeScript类型定义
```

## 注意事项

- 本项目使用 wechaty-puppet-wechat4u 作为微信协议实现
- 需要遵守微信相关使用规范
- 建议合理使用自动回复功能，避免被封号

## 贡献指南

1. Fork 本仓库
2. 创建新的功能分支
3. 提交你的更改
4. 发起 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提 Issue 或 PR。

## 开发工具推荐

- [VSCode](https://code.visualstudio.com/)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

## 更新日志

### v1.0.0

- 实现基础的机器人功能
- 添加自动回复管理
- 支持群聊和私聊消息
- 添加数据统计功能
