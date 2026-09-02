#!/usr/bin/env bash
# GodLock one-click install. Counted download via this project's Worker.
# Usage: curl -fsSL https://godlock-download-tracker.vibelock.workers.dev/install.sh | bash
set -euo pipefail

HOST="${GODLOCK_HOME_HOST:-https://godlock-download-tracker.vibelock.workers.dev}"
ASSET="${GODLOCK_HOME_ASSET:-godlock-0.1.0.tar.gz}"
WORKDIR="${GODLOCK_HOME:-$HOME/godlock}"

mkdir -p "$WORKDIR"
cd "$WORKDIR"

echo "Downloading counted tarball from ${HOST}/download (User-Agent Mozilla/5.0)…"
curl -fsSL -A 'Mozilla/5.0' "${HOST}/download?asset=${ASSET}" -o "${ASSET}"

tar -xzf "${ASSET}"
DIR="$(find . -maxdepth 1 -type d -name 'godlock-*' | head -n 1)"
if [ -n "${DIR}" ]; then
  cd "${DIR}"
fi

python3 -m venv .venv
# shellcheck disable=SC1091
. .venv/bin/activate
python -m pip install -U pip
python -m pip install -e .

echo
echo "Installed GodLock."
echo "Run:  godlock ui"
echo "Then open http://127.0.0.1:8080  (loopback only)"
echo "Author: Aziel Eliab."
