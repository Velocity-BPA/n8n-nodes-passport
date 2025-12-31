#!/bin/bash
#
# n8n-nodes-passport local installation script
# Copyright (c) 2025 Velocity BPA
# Licensed under BSL 1.1

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "================================================"
echo "  n8n-nodes-passport Local Installation"
echo "================================================"
echo ""

# Parse arguments
UNINSTALL=false
LINK_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --uninstall|-u)
            UNINSTALL=true
            shift
            ;;
        --link|-l)
            LINK_MODE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -l, --link       Use npm link (for development)"
            echo "  -u, --uninstall  Uninstall from n8n"
            echo "  -h, --help       Show this help message"
            echo ""
            echo "This script installs the node package into your local n8n"
            echo "installation for testing."
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Detect n8n installation
N8N_CUSTOM_EXTENSIONS=""

# Check common locations
if [ -d "$HOME/.n8n/custom" ]; then
    N8N_CUSTOM_EXTENSIONS="$HOME/.n8n/custom"
elif [ -d "$HOME/.n8n/nodes" ]; then
    N8N_CUSTOM_EXTENSIONS="$HOME/.n8n/nodes"
elif [ -n "$N8N_CUSTOM_EXTENSIONS" ]; then
    # Environment variable set
    :
else
    # Create default directory
    mkdir -p "$HOME/.n8n/custom"
    N8N_CUSTOM_EXTENSIONS="$HOME/.n8n/custom"
fi

echo "n8n custom extensions directory: $N8N_CUSTOM_EXTENSIONS"
echo ""

PACKAGE_NAME="n8n-nodes-passport"

# Uninstall mode
if [ "$UNINSTALL" = true ]; then
    echo "🗑️  Uninstalling $PACKAGE_NAME..."
    
    if [ "$LINK_MODE" = true ]; then
        cd "$N8N_CUSTOM_EXTENSIONS"
        npm unlink "$PACKAGE_NAME" 2>/dev/null || true
        cd "$PROJECT_ROOT"
        npm unlink 2>/dev/null || true
    else
        rm -rf "$N8N_CUSTOM_EXTENSIONS/node_modules/$PACKAGE_NAME"
    fi
    
    echo "  ✓ Uninstalled"
    echo ""
    echo "Restart n8n to complete removal."
    exit 0
fi

# Build first
if [ ! -d "dist" ]; then
    echo "📦 Building package first..."
    ./scripts/build.sh --skip-tests
    echo ""
fi

# Link mode (for development)
if [ "$LINK_MODE" = true ]; then
    echo "🔗 Creating npm link..."
    
    # Create global link from this package
    npm link
    
    # Link into n8n custom directory
    cd "$N8N_CUSTOM_EXTENSIONS"
    npm link "$PACKAGE_NAME"
    cd "$PROJECT_ROOT"
    
    echo "  ✓ Linked for development"
    echo ""
    echo "Changes to source will be reflected after rebuilding."
else
    # Copy mode (for testing)
    echo "📋 Installing to n8n..."
    
    # Create package tarball
    TARBALL=$(npm pack 2>/dev/null | tail -1)
    
    # Install into n8n custom directory
    cd "$N8N_CUSTOM_EXTENSIONS"
    npm install "$PROJECT_ROOT/$TARBALL"
    cd "$PROJECT_ROOT"
    
    # Clean up tarball
    rm -f "$TARBALL"
    
    echo "  ✓ Installed"
fi

echo ""
echo "================================================"
echo "  Installation complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "  1. Restart n8n"
echo "  2. Look for 'Passport' in the node list"
echo "  3. Configure credentials (Passport Device, Bitcoin Network)"
echo ""
echo "To uninstall: $0 --uninstall"
