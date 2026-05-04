# FoxCloud 能源仪表盘

这是一个适合初学者使用的家庭能源仪表盘，可以通过 FoxCloud OpenAPI 或本地只读 Modbus TCP 读取逆变器、电池和用电数据。

设计目标是：安全、简单、容易部署，并且适合其他 Fox ESS / FoxCloud 用户克隆后自行配置使用。

## 重要安全提醒

- 不要把真实 API key、FoxCloud 密码、GitHub 密码、逆变器完整序列号提交到 GitHub。
- 不要把 `.env`、SQLite 数据库、备份文件上传到 GitHub。
- API key 和密码只放在服务器端 `.env` 文件里，不要写进前端 JavaScript。
- 如果要开放到互联网，请使用 HTTPS、反向代理和仪表盘登录密码。

## 支持的运行方式

- macOS
- Windows
- Linux
- Docker / Synology Container Manager

## 两种数据来源

### FoxCloud 模式

使用 FoxCloud OpenAPI。优点是容易开始，适合大多数用户。缺点是依赖互联网和 FoxCloud API 限制。

```dotenv
DATA_PROVIDER=foxcloud
FOXCLOUD_BASE_URL=https://www.foxesscloud.com
FOXCLOUD_DEMO_MODE=false
FOXCLOUD_API_KEY=your-own-api-key
FOXCLOUD_DEVICE_SN=optional-device-serial-number
```

### 本地 Modbus 模式

直接通过局域网读取逆变器 / datalogger 的 Modbus TCP 数据。优点是不需要 FoxCloud API key，数据更实时，也不依赖互联网。

```dotenv
DATA_PROVIDER=modbus
MODBUS_HOST=your-inverter-lan-ip
MODBUS_PORT=502
MODBUS_UNIT_ID=1
MODBUS_SAMPLE_INTERVAL_MS=60000
MODBUS_READ_ONLY=true
```

使用前可以先测试连接：

```bash
nc -zv your-inverter-lan-ip 502
```

如果显示连接成功，仪表盘就可以尝试读取本地 Modbus 数据。

## 本地安装步骤

1. 安装 Node.js 20 或更新版本。
2. 下载或 clone 本项目。
3. 在项目目录运行：

```bash
npm install
```

4. 创建本地 `.env`：

```bash
cp .env.example .env
```

也可以使用交互式设置：

```bash
npm run setup
```

5. 编辑 `.env`，填入你自己的配置。

6. 构建并启动：

```bash
npm run build
npm start
```

7. 打开：

```text
http://localhost:3000
```

浏览器会弹出登录窗口，请输入 `.env` 中的 `DASHBOARD_USERNAME` 和 `DASHBOARD_PASSWORD`。

不要使用 `http://username:password@localhost:3000` 这种带密码的 URL 打开网页。有些浏览器会阻止这种页面继续发起 `fetch` 请求。

## 常用环境变量

```dotenv
PORT=3000
HOST=0.0.0.0
DASHBOARD_TIME_ZONE=Australia/Sydney
DATA_PROVIDER=foxcloud
FOXCLOUD_BASE_URL=https://www.foxesscloud.com
FOXCLOUD_DEMO_MODE=false
FOXCLOUD_API_KEY=your-own-api-key
FOXCLOUD_DEVICE_SN=
FOXCLOUD_TIMEOUT_MS=15000
DASHBOARD_USERNAME=your-dashboard-login-name
DASHBOARD_PASSWORD=your-dashboard-password
DASHBOARD_USERS=
```

增加测试用户示例：

```dotenv
DASHBOARD_USERS=Foxtester=strong-test-password
```

多个用户用逗号分隔：

```dotenv
DASHBOARD_USERS=Friend1=strong-password-1,Friend2=strong-password-2
```

请避免在密码里使用逗号，因为逗号用于分隔多个用户。

## 开发模式

```bash
npm run dev
```

如果修改了 `.env`，需要先用 `Ctrl+C` 停止，再重新运行 `npm run dev`。开发模式不会自动重新加载环境变量。

## 数据存储

每日能源数据会存储在本地 SQLite：

```text
data/foxcloud-dashboard.sqlite
```

这个文件是你自己的私有数据，已经被 `.gitignore` 排除，不应该提交到 GitHub。

如果启用备份，备份文件会写入：

```text
data/backups/
```

## Docker / Synology 简要说明

Synology 推荐使用 Container Manager / Docker 部署。项目目录中已有：

- `Dockerfile`
- `docker-compose.example.yml`
- `docker-compose.synology.yml`

部署时请确保：

- `.env` 放在 NAS 项目目录中。
- `data/` 保持持久化，不要在 rebuild 时删除。
- 不要把 `.env` 和 SQLite 数据库提交到 GitHub。

## 常用命令

```bash
npm run check
npm test
npm run build
npm start
```

## 已知维护原则

- 不要大规模重写整个项目。
- 每次只做小的、可回滚的修复。
- 保留现有功能。
- 先本地 HTTP 测试，再同步 NAS。
- 安全响应头 / CSP / Helmet 需要单独测试，不能直接加入主流程。

## 反馈问题时请提供

- 操作系统：macOS、Windows、Linux 或 Synology。
- 使用 FoxCloud 还是 Modbus。
- 浏览器名称。
- 错误截图，注意遮住 API key、密码和完整序列号。
- 终端或容器日志，注意删除敏感信息。
