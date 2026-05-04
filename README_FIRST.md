# Read Me First: FoxCloud Energy Dashboard

This guide is for people who want to test the dashboard on their own home network.

It works on:

- macOS
- Windows
- Linux

This guide does not cover NAS hosting or Internet publishing. Start here first, then deploy later if the dashboard works for you.

## What You Need

- Either a Fox ESS / FoxCloud account with OpenAPI access, or a supported inverter/datalogger with local Modbus TCP enabled.
- Your own FoxCloud API key if you use FoxCloud mode.
- Node.js 20 or newer.
- A computer that can stay on while you test the dashboard.

Do not put your API key, password, or private data into GitHub issues, screenshots, or chat messages.

## 1. Install Node.js

Download and install Node.js from:

```text
https://nodejs.org/
```

Choose the LTS version.

Check it installed:

```bash
node -v
npm -v
```

## 2. Download This Project

Option A: Download ZIP from GitHub.

1. Open the GitHub repository page.
2. Click `Code`.
3. Click `Download ZIP`.
4. Unzip it.
5. Open Terminal, PowerShell, or Command Prompt in the project folder.

Option B: Use Git.

```bash
git clone REPLACE_WITH_REPOSITORY_URL
cd foxcloud-energy-dashboard
```

## 3. Install Dependencies

Run:

```bash
npm install
```

## 4. Create Your Local Settings

Easy setup:

```bash
npm run setup
```

The setup command creates a local `.env` file. This file is ignored by Git and should stay private.

You will be asked for:

- FoxCloud API key
- whether to use demo mode
- optional FoxCloud device serial number
- dashboard login username
- dashboard login password
- optional extra dashboard users

If you do not have a FoxCloud API key yet, choose demo mode. Demo mode uses sample data so you can preview the dashboard safely.

If you prefer manual setup:

```bash
cp .env.example .env
```

Then edit `.env` yourself.

Minimum example:

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

Demo mode example:

```dotenv
FOXCLOUD_DEMO_MODE=true
FOXCLOUD_API_KEY=
```

Local Modbus example:

```dotenv
DATA_PROVIDER=modbus
MODBUS_HOST=your-inverter-lan-ip
MODBUS_PORT=502
MODBUS_UNIT_ID=1
MODBUS_SAMPLE_INTERVAL_MS=60000
MODBUS_READ_ONLY=true
DASHBOARD_USERNAME=your-dashboard-login-name
DASHBOARD_PASSWORD=your-dashboard-password
```

Before using Modbus mode, test that your computer can reach the inverter:

```bash
nc -zv your-inverter-lan-ip 502
```

If the connection succeeds, the dashboard can try reading local Modbus data. The first Modbus version is read-only and currently targets FoxESS H3 Smart style registers. Other inverter models may need register-map updates.

To add a test user:

```dotenv
DASHBOARD_USERS=Foxtester=strong-test-password
```

To add more than one:

```dotenv
DASHBOARD_USERS=Friend1=strong-password-1,Friend2=strong-password-2
```

Avoid commas in passwords because commas separate users.

## 5. Build and Run

Run:

```bash
npm run build
npm start
```

Open this on the same computer:

```text
http://localhost:3000
```

You should see a login prompt. Use the dashboard username and password from your `.env`.

## 6. Open From Another Device on Your Home Network

When the server starts, it prints LAN URLs such as:

```text
http://192.168.0.20:3000
```

Open that address from another device on the same Wi-Fi network.

If it does not open:

- Make sure both devices are on the same network.
- Allow Node.js through the computer firewall.
- Keep the computer running the server awake.
- Check that `HOST=0.0.0.0` is set in `.env`.

## 7. Update Data

Use the dashboard `Refresh` button.

The app stores daily data locally in:

```text
data/foxcloud-dashboard.sqlite
```

This database is private to your installation and is ignored by Git.

If you use Docker, the app can also write safe SQLite backups to:

```text
backups/
```

On the NAS project folder, that is:

```text
/Volumes/Newhome/docker/foxcloud-dashboard/backups
```

## 8. Safety Notes

- Never commit `.env`.
- Never paste your FoxCloud API key into GitHub issues.
- Never put API keys in frontend/browser code.
- Use a dashboard password even on your home network.
- For Internet access, use HTTPS and a reverse proxy. Do not expose port `3000` directly.

## 9. How To Give Feedback

Useful feedback includes:

- Your inverter/battery model.
- Operating system: macOS, Windows, or Linux.
- Browser name.
- Whether local access works.
- Whether LAN access works.
- Screenshot with private serial numbers hidden.
- Error message from the terminal, with secrets removed.

Do not share:

- FoxCloud API key
- FoxCloud password
- dashboard password
- full device serial number, unless you are comfortable making it public

## 10. Common Commands

Start development mode:

```bash
npm run dev
```

If you change `.env` while `npm run dev` is running, stop it with `Ctrl+C` and start it
again. The development watcher does not automatically reload environment variable
changes.

Build production files:

```bash
npm run build
```

Run production server:

```bash
npm start
```

Check TypeScript:

```bash
npm run check
```

Run tests:

```bash
npm test
```

Run setup again:

```bash
npm run setup
```
