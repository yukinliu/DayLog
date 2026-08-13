#!/bin/bash

set -euo pipefail

project_dir="$(cd "$(dirname "$0")/.." && pwd)"
app_path="$project_dir/src-tauri/target/release/bundle/macos/见己.app"
dmg_dir="$project_dir/src-tauri/target/release/bundle/dmg"
dmg_path="$dmg_dir/见己_0.1.1_aarch64.dmg"
stage_dir="$(mktemp -d /private/tmp/jianji-macos-release.XXXXXX)"

cleanup() {
  rm -rf "$stage_dir"
}
trap cleanup EXIT

cd "$project_dir"
PATH="$HOME/.cargo/bin:$PATH" npx tauri build --bundles app

# Without a Developer ID certificate this is an ad-hoc signature. It keeps the
# whole bundle internally consistent, but it does not replace Apple notarization.
codesign --force --deep --sign - "$app_path"
codesign --verify --deep --strict --verbose=2 "$app_path"

ditto "$app_path" "$stage_dir/见己.app"
ln -s /Applications "$stage_dir/Applications"
mkdir -p "$dmg_dir"
hdiutil create -volname "见己" -srcfolder "$stage_dir" -ov -format UDZO "$dmg_path"
hdiutil verify "$dmg_path"

echo "macOS DMG created: $dmg_path"
