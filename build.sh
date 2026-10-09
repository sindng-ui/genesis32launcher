#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Building G3P2Launcher ==="

CSC="/mnt/c/Windows/Microsoft.NET/Framework64/v4.0.30319/csc.exe"
if [ ! -f "$CSC" ]; then
    CSC="/mnt/c/Windows/Microsoft.NET/Framework/v4.0.30319/csc.exe"
fi

if [ ! -f "$CSC" ]; then
    echo "Error: csc.exe compiler not found!"
    exit 1
fi

mkdir -p bin

# Collect all C# source files and convert to Windows-style paths
SOURCES=(
    "src\\Win32\\Win32Api.cs"
    "src\\Core\\DDrawConfig.cs"
    "src\\Core\\AudioRegistryHelper.cs"
    "src\\Core\\GameEmbedder.cs"
    "src\\UI\\LauncherTheme.cs"
    "src\\UI\\ModernButton.cs"
    "src\\UI\\ModernSlider.cs"
    "src\\UI\\LauncherForm.cs"
    "src\\Program.cs"
)

OUT_EXE="bin\\G3P2Launcher.exe"

# Run compiler
"$CSC" \
    /target:winexe \
    /platform:anycpu \
    /optimize+ \
    /r:System.dll \
    /r:System.Drawing.dll \
    /r:System.Windows.Forms.dll \
    /r:System.Core.dll \
    /out:"$OUT_EXE" \
    "${SOURCES[@]}"

echo "=== Build successful! Output: bin/G3P2Launcher.exe ==="
ls -lh bin/G3P2Launcher.exe
