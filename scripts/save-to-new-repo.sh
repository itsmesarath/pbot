#!/usr/bin/env bash
set -euo pipefail

DEFAULT_ROOT="../exports"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
DEFAULT_DEST="$DEFAULT_ROOT/fabio-bot-$TIMESTAMP"

DEST="${1:-}"

if [[ -z "$DEST" ]]; then
  mkdir -p "$DEFAULT_ROOT"
  DEST="$DEFAULT_DEST"
fi

if [[ -e "$DEST" ]]; then
  echo "Error: destination path '$DEST' already exists." >&2
  exit 1
fi

mkdir -p "$DEST"

git archive --format=tar HEAD | tar -x -C "$DEST"

(
  cd "$DEST"
  git init >/dev/null
  git add .
  git commit -m "Initial commit of Fabio bot" >/dev/null
)

cat <<SUMMARY
New repository created at: $DEST

Next steps:
  cd "$DEST"
  git remote add origin <your-remote-url>
  git push -u origin main
SUMMARY
