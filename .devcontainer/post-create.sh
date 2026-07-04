#!/usr/bin/env bash
set -euo pipefail

# Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Project dependencies
npm ci
