# CCABay

CCABay is a Vite + React + Supabase app.

## 1) Clone the project

```bash
git clone https://github.com/notbouncee/CCABay.git
cd CCABay
```

## 2) Create your local `.env` file

Clone the example env file:

```bash
cp .env.example .env
```

Then open `.env` and fill in values.

Required values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (only needed for admin tasks such as seeding)

Important:

- Never commit `.env`.
- `.env.example` is safe to commit.

## 3) Find your Supabase keys

In Supabase dashboard:

1. Open your project.
2. Go to **Project Settings** > **API**.
3. Copy:
	- **Project URL** -> `VITE_SUPABASE_URL`
	- **anon public key** -> `VITE_SUPABASE_PUBLISHABLE_KEY`
	- **service_role key** -> `SUPABASE_SERVICE_ROLE_KEY`

Security notes:

- `VITE_SUPABASE_PUBLISHABLE_KEY` is okay for frontend usage.
- `SUPABASE_SERVICE_ROLE_KEY` is secret. Use it only in secure server/admin scripts.

## 4) Install dependencies

```bash
npm install
```

## 5) Run security fix (recommended)

```bash
npm audit fix
```

## 6) Start the website (development)

```bash
npm run dev
```

After running, open the local URL shown in your terminal.

## 7) Set up Figma MCP in VS Code

This project uses the Figma MCP server so Copilot can read design context directly from Figma.

Option A: Manual config file

Create or confirm this file exists:

- `.vscode/mcp.json`

Use this config:

```json
{
	"servers": {
		"figma": {
			"url": "https://mcp.figma.com/mcp",
			"type": "http"
		}
	},
	"inputs": []
}
```

Option B: Command Palette setup

1. Open Command Palette (`Cmd+Shift+P`).
2. Run an MCP server setup command (for example `MCP: Add Server`).
3. Choose HTTP server type.
4. Enter URL: `https://mcp.figma.com/mcp`.
5. Name it `figma`.
6. Save to workspace settings (`.vscode/mcp.json`).

Then reload VS Code (`Developer: Reload Window`) so the MCP server is picked up.

## 8) Use Figma MCP (select layer + provide URL)

1. In Figma, select the layer/frame/component you want to implement.
2. Copy the link to that selection (it must include `node-id`).
3. In VS Code Copilot Chat, send the Figma URL and ask for design context or implementation.

Example prompt:

```text
Use mcp_figma_get_design_context for this URL:
https://www.figma.com/design/FILE_KEY/File-Name?node-id=332-330
Then update my homepage to match it.
```

Tips:

- If the URL has no `node-id`, re-copy the link from the selected layer in Figma.
- You can target a different layer by selecting it and copying that layer URL again.
- Keep using the same prompt style for faster design-to-code updates.

## Useful commands

```bash
npm run build
npm run preview
npm run test
```
