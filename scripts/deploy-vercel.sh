#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
quarto_bin="${QUARTO_BIN:-quarto}"
cd "$project_dir"

# Quarto finds TinyTeX itself, but the course's imagify filter calls latex directly.
if ! command -v latex >/dev/null 2>&1; then
  for tex_bin in "$HOME"/Library/TinyTeX/bin/* "$HOME"/.TinyTeX/bin/*; do
    if [[ -x "$tex_bin/latex" ]]; then
      export PATH="$tex_bin:$PATH"
      break
    fi
  done
fi

if [[ "$("$quarto_bin" --version)" != "1.6.39" ]]; then
  echo "Use Quarto 1.6.39; newer versions can break the course's algorithm formulas." >&2
  exit 1
fi

# Keep the Vercel project link outside Quarto's disposable output directory.
if [[ -d _book/.vercel ]]; then
  mkdir -p .vercel
  cp -R _book/.vercel/. .vercel/
fi

"$quarto_bin" render
cp vercel.static.json _book/vercel.json
printf '.env*\n.vercel\n.gitignore\n' > _book/.vercelignore
if [[ -d .vercel ]]; then
  mkdir -p _book/.vercel
  cp -R .vercel/. _book/.vercel/
fi
npx --yes vercel@60.0.1 --cwd "$project_dir/_book" --prod "$@"
if [[ -d _book/.vercel ]]; then
  mkdir -p .vercel
  cp -R _book/.vercel/. .vercel/
fi
