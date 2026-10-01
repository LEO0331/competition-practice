#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
# No installation, deletion, or deployment: use npm ci separately on a fresh checkout.
npm run verify
