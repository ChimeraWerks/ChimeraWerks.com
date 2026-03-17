#Requires -Version 5.1
<#
.SYNOPSIS
    Claude Code CLI + Desktop extension/MCP setup script.
    Shared from ChimeraWerks dev environment.

.DESCRIPTION
    Installs and configures:
      - Claude Code CLI plugins (14 plugins)
      - MCP servers for both CLI and Desktop (everything-search, comfyui)
      - Prerequisites: uv, semgrep, Voidtools Everything + SDK

    Run in an elevated PowerShell if you want Everything installed via winget.
    Non-elevated is fine for everything else.

.NOTES
    Generated 2026-03-17. Paths are auto-resolved for the current user.
#>

param(
    [switch]$SkipPrereqs,
    [switch]$SkipPlugins,
    [switch]$SkipMCP,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# --- Colors ---
function Write-Step($msg)    { Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)      { Write-Host "   OK: $msg" -ForegroundColor Green }
function Write-Skip($msg)    { Write-Host "   SKIP: $msg" -ForegroundColor Yellow }
function Write-Fail($msg)    { Write-Host "   FAIL: $msg" -ForegroundColor Red }

# --- Paths ---
$UserHome       = $env:USERPROFILE
$ClaudeDir      = Join-Path $UserHome ".claude"
$ClaudeSettings = Join-Path $ClaudeDir "settings.json"
$ClaudeMcp      = Join-Path $ClaudeDir ".mcp.json"
$CcdConfig      = Join-Path $env:APPDATA "Claude\claude_desktop_config.json"
$EverythingSdk  = Join-Path $UserHome ".local\everything-sdk\dll\Everything64.dll"

Write-Host @"

========================================
  Claude Code Extension Setup
========================================
  Plugins:  $(if ($SkipPlugins) {'SKIP'} else {'YES'})
  MCP:      $(if ($SkipMCP) {'SKIP'} else {'YES'})
  Prereqs:  $(if ($SkipPrereqs) {'SKIP'} else {'YES'})
  Dry run:  $DryRun
========================================
"@ -ForegroundColor White

# ============================================================
# SECTION 1: Prerequisites
# ============================================================
if (-not $SkipPrereqs) {
    Write-Step "Installing prerequisites"

    # --- uv (Python package runner, needed for MCP servers) ---
    if (Get-Command uvx -ErrorAction SilentlyContinue) {
        Write-Ok "uv already installed ($(& uv --version 2>$null))"
    } else {
        Write-Host "   Installing uv..." -ForegroundColor White
        if (-not $DryRun) {
            Invoke-RestMethod https://astral.sh/uv/install.ps1 | Invoke-Expression
        }
        Write-Ok "uv installed"
    }

    # --- semgrep (code security scanner) ---
    if (Get-Command semgrep -ErrorAction SilentlyContinue) {
        $semVer = & semgrep --version 2>$null
        if ($semVer) {
            Write-Ok "semgrep already installed (v$semVer)"
        } else {
            Write-Skip "semgrep found but broken, reinstalling..."
            if (-not $DryRun) { pip install semgrep --quiet }
        }
    } else {
        Write-Host "   Installing semgrep..." -ForegroundColor White
        if (-not $DryRun) {
            pip install semgrep --quiet
            # Ensure it's on PATH - copy to a PATH location if needed
            $semPath = (pip show semgrep 2>$null | Select-String "Location").ToString().Split(": ")[1]
            Write-Host "   Installed to: $semPath" -ForegroundColor Gray
        }
        Write-Ok "semgrep installed"
    }

    # --- Voidtools Everything (instant file search) ---
    $everythingRunning = Get-Process "Everything" -ErrorAction SilentlyContinue
    if ($everythingRunning) {
        Write-Ok "Voidtools Everything already running"
    } else {
        $everythingExe = Get-Command "Everything.exe" -ErrorAction SilentlyContinue
        if ($everythingExe) {
            Write-Ok "Everything installed at $($everythingExe.Source)"
            Write-Host "   TIP: Start Everything and enable 'Run as administrator' + 'Start on boot'" -ForegroundColor Yellow
        } else {
            Write-Host "   Installing Voidtools Everything via winget..." -ForegroundColor White
            if (-not $DryRun) {
                winget install --id voidtools.Everything --accept-source-agreements --accept-package-agreements 2>$null
            }
            Write-Ok "Everything installed"
            Write-Host "   TIP: Launch Everything, enable 'Run as administrator' + 'Start on boot'" -ForegroundColor Yellow
        }
    }

    # --- Everything SDK (needed for MCP server) ---
    if (Test-Path $EverythingSdk) {
        Write-Ok "Everything SDK already at $EverythingSdk"
    } else {
        Write-Host "   Downloading Everything SDK..." -ForegroundColor White
        if (-not $DryRun) {
            $sdkDir = Split-Path $EverythingSdk -Parent
            $sdkRoot = Join-Path $UserHome ".local\everything-sdk"
            New-Item -ItemType Directory -Path $sdkDir -Force | Out-Null
            $zipPath = Join-Path $env:TEMP "everything-sdk.zip"
            Invoke-WebRequest "https://www.voidtools.com/Everything-SDK.zip" -OutFile $zipPath
            Expand-Archive $zipPath -DestinationPath $sdkRoot -Force
            Remove-Item $zipPath
        }
        if (Test-Path $EverythingSdk) {
            Write-Ok "Everything SDK extracted to $sdkRoot"
        } else {
            Write-Fail "SDK download may have failed. Manually download from https://www.voidtools.com/Everything-SDK.zip"
            Write-Host "   Extract Everything64.dll to: $EverythingSdk" -ForegroundColor Yellow
        }
    }

    # --- Pre-cache the everything-search MCP package ---
    Write-Host "   Pre-caching everything-search MCP server..." -ForegroundColor White
    if (-not $DryRun) {
        & uvx mcp-server-everything-search --help 2>$null | Out-Null
    }
    Write-Ok "MCP server package cached"
}

# ============================================================
# SECTION 2: Claude Code CLI Plugins
# ============================================================
if (-not $SkipPlugins) {
    Write-Step "Configuring Claude Code CLI plugins"

    $plugins = @{
        # Official plugins
        "pr-review-toolkit@claude-plugins-official"  = $true
        "code-simplifier@claude-plugins-official"    = $true
        "security-guidance@claude-plugins-official"  = $true
        "claude-md-management@claude-plugins-official" = $true
        "github@claude-plugins-official"             = $true
        "playwright@claude-plugins-official"         = $true
        "frontend-design@claude-plugins-official"    = $true
        "coderabbit@claude-plugins-official"         = $true
        "semgrep@claude-plugins-official"            = $true
        "firecrawl@claude-plugins-official"          = $true
        "context7@claude-plugins-official"           = $true
        "feature-dev@claude-plugins-official"        = $true
        # Community skill packs
        "document-skills@anthropic-agent-skills"     = $true
        "example-skills@anthropic-agent-skills"      = $true
        "claude-api@anthropic-agent-skills"          = $true
    }

    $extraMarketplaces = @{
        "anthropic-agent-skills" = @{
            "source" = @{
                "source" = "github"
                "repo"   = "anthropics/skills"
            }
        }
    }

    # Load or create settings.json
    if (Test-Path $ClaudeSettings) {
        $settings = Get-Content $ClaudeSettings -Raw | ConvertFrom-Json
        Write-Host "   Loaded existing settings.json" -ForegroundColor Gray
    } else {
        New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null
        $settings = [PSCustomObject]@{}
        Write-Host "   Creating new settings.json" -ForegroundColor Gray
    }

    # Merge plugins (don't overwrite existing ones)
    if (-not $settings.PSObject.Properties["enabledPlugins"]) {
        $settings | Add-Member -NotePropertyName "enabledPlugins" -NotePropertyValue ([PSCustomObject]@{})
    }
    foreach ($key in $plugins.Keys) {
        if (-not $settings.enabledPlugins.PSObject.Properties[$key]) {
            $settings.enabledPlugins | Add-Member -NotePropertyName $key -NotePropertyValue $true
            Write-Ok "Enabled: $key"
        } else {
            Write-Skip "Already enabled: $key"
        }
    }

    # Merge extra marketplaces
    if (-not $settings.PSObject.Properties["extraKnownMarketplaces"]) {
        $settings | Add-Member -NotePropertyName "extraKnownMarketplaces" -NotePropertyValue ([PSCustomObject]@{})
    }
    if (-not $settings.extraKnownMarketplaces.PSObject.Properties["anthropic-agent-skills"]) {
        $settings.extraKnownMarketplaces | Add-Member -NotePropertyName "anthropic-agent-skills" -NotePropertyValue ([PSCustomObject]@{
            source = [PSCustomObject]@{ source = "github"; repo = "anthropics/skills" }
        })
        Write-Ok "Added anthropic-agent-skills marketplace"
    }

    if (-not $DryRun) {
        $settings | ConvertTo-Json -Depth 10 | Set-Content $ClaudeSettings -Encoding UTF8
        Write-Ok "Saved $ClaudeSettings"
    }
}

# ============================================================
# SECTION 3: MCP Servers (CLI + Desktop)
# ============================================================
if (-not $SkipMCP) {
    Write-Step "Configuring MCP servers"

    # --- Build MCP server definitions ---
    $mcpServers = @{}

    # Everything Search (requires Everything running + SDK DLL)
    if (Test-Path $EverythingSdk) {
        $mcpServers["everything-search"] = @{
            command = "uvx"
            args    = @("mcp-server-everything-search")
            env     = @{ EVERYTHING_SDK_PATH = $EverythingSdk.Replace("/", "\") }
        }
        Write-Ok "everything-search MCP configured"
    } else {
        Write-Skip "everything-search: SDK not found at $EverythingSdk"
    }

    # Add comfyui MCP only if comfy-pilot exists
    # (Uncomment and adjust path if your friend uses ComfyUI)
    # $comfyPilot = "C:\path\to\ComfyUI\custom_nodes\comfy-pilot\mcp_server.py"
    # if (Test-Path $comfyPilot) {
    #     $mcpServers["comfyui"] = @{
    #         command = "python"
    #         args    = @($comfyPilot)
    #     }
    # }

    if ($mcpServers.Count -eq 0) {
        Write-Skip "No MCP servers to configure"
    } else {
        # --- Write CLI config (.claude/.mcp.json) ---
        $cliMcp = @{ mcpServers = $mcpServers }
        if (-not $DryRun) {
            New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null
            $cliMcp | ConvertTo-Json -Depth 5 | Set-Content $ClaudeMcp -Encoding UTF8
            Write-Ok "CLI MCP config: $ClaudeMcp"
        }

        # --- Write Desktop config (merge into existing) ---
        if (Test-Path $CcdConfig) {
            $ccdJson = Get-Content $CcdConfig -Raw | ConvertFrom-Json
        } else {
            $ccdDir = Split-Path $CcdConfig -Parent
            New-Item -ItemType Directory -Path $ccdDir -Force | Out-Null
            $ccdJson = [PSCustomObject]@{}
        }

        if (-not $ccdJson.PSObject.Properties["mcpServers"]) {
            $ccdJson | Add-Member -NotePropertyName "mcpServers" -NotePropertyValue ([PSCustomObject]@{})
        }

        foreach ($name in $mcpServers.Keys) {
            $serverObj = [PSCustomObject]$mcpServers[$name]
            if ($ccdJson.mcpServers.PSObject.Properties[$name]) {
                Write-Skip "CCD already has '$name' MCP"
            } else {
                $ccdJson.mcpServers | Add-Member -NotePropertyName $name -NotePropertyValue $serverObj
                Write-Ok "CCD: added '$name' MCP"
            }
        }

        if (-not $DryRun) {
            $ccdJson | ConvertTo-Json -Depth 5 | Set-Content $CcdConfig -Encoding UTF8
            Write-Ok "CCD config: $CcdConfig"
        }
    }
}

# ============================================================
# DONE
# ============================================================
Write-Host @"

========================================
  Setup complete!
========================================

Next steps:
  1. Restart Claude Code CLI (close + reopen terminal)
  2. Restart Claude Code Desktop (fully quit + relaunch)
  3. Make sure Voidtools Everything is running (system tray)
  4. Run '/mcp' in Claude Code to verify MCP servers connected

Plugins installed (run '/plugins' in Claude Code to manage):
  - pr-review-toolkit    Code review agents
  - code-simplifier      Auto-simplify code
  - security-guidance    Security best practices
  - claude-md-management CLAUDE.md management
  - github               GitHub integration
  - playwright           Browser automation
  - frontend-design      UI/UX design
  - coderabbit           CodeRabbit reviews
  - semgrep              Code security scanning
  - firecrawl            Web scraping/research
  - context7             Library documentation
  - feature-dev          Feature development

MCP servers:
  - everything-search    Instant file search (requires Everything running)

"@ -ForegroundColor Green
