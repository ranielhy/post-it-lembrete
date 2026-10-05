#!/usr/bin/env bash

set -euo pipefail

if ! command -v unsquashfs >/dev/null 2>&1; then
  echo "Erro: instale squashfs-tools para validar o pacote Snap." >&2
  exit 1
fi

snap_file="${1:-}"
if [[ -z "$snap_file" ]]; then
  snap_file="$(find dist -maxdepth 1 -type f -name '*.snap' -printf '%T@ %p\n' \
    | sort -nr \
    | head -n 1 \
    | cut -d' ' -f2-)"
fi

if [[ -z "$snap_file" || ! -f "$snap_file" ]]; then
  echo "Erro: nenhum arquivo .snap foi encontrado em dist/." >&2
  exit 1
fi

contents="$(unsquashfs -ll "$snap_file")"

for required_file in desktop-init.sh desktop-common.sh desktop-gnome-specific.sh; do
  if ! grep -q "/$required_file$" <<<"$contents"; then
    echo "Erro: $required_file não foi incluído em $snap_file." >&2
    exit 1
  fi
done

if grep -q '/snap-template-electron-.*\.tar$' <<<"$contents"; then
  echo "Erro: o template do Electron ficou fechado dentro do Snap." >&2
  exit 1
fi

echo "Snap validado: $snap_file"
