#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  cat <<USAGE >&2
Usage: $0 <destination-directory>

Creates a fresh git repository populated with the current project sources.
USAGE
  exit 1
fi

DEST="$1"

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

echo "New repository created at $DEST"
