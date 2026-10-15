# Sparx Science Assistant（中文说明）

本项目是一个本地 Chrome 扩展与 Playwright 自动化服务，用于读取 Sparx Science 题目、生成可复核答案，并填写到当前题目页面。

## 使用方法

1. 解压 release ZIP。
2. 打开 `chrome://extensions`，开启“开发者模式”。
3. 点击“加载已解压的扩展程序”，选择解压后的目录。
4. 在目录中运行 `npm install`。
5. 将 `.env.example` 复制为 `.env` 并填写 API Key。
6. 用 Chrome 远程调试模式启动浏览器，再运行 `start-all.ps1`。
7. 打开 Sparx 题目，点击扩展图标。
8. 依次点击“读取并解题”和“填入答案”。

## 配置

`.env` 示例：

```text
OPENAI_API_KEY=你的密钥
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-6.1-sol
```

本地解题服务端口为 8787，Playwright 自动化服务端口为 8788，Chrome 调试端口为 9222。

## 题型支持

支持图片题、数字题、文字题、选择题和连线题。数字题使用页面数字键盘，文字题使用剪贴板粘贴，答案预览按题目顺序分开显示。

## 发布安装

下载 `release/SparxScienceAssistant-2.0.0.zip`，解压后按照上面的扩展安装步骤加载。公开发布时不要包含 `.env`、API Key、浏览器用户目录和调试日志。

Made by Samse.
