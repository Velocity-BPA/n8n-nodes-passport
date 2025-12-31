#!/bin/bash
#
# n8n-nodes-passport build script
# Copyright (c) 2025 Velocity BPA
# Licensed under BSL 1.1

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "================================================"
echo "  n8n-nodes-passport Build"
echo "================================================"
echo ""

# Parse arguments
CLEAN=false
PRODUCTION=false
SKIP_TESTS=false
PACK=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --clean|-c)
            CLEAN=true
            shift
            ;;
        --production|-p)
            PRODUCTION=true
            shift
            ;;
        --skip-tests|-s)
            SKIP_TESTS=true
            shift
            ;;
        --pack)
            PACK=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -c, --clean        Clean build directory before building"
            echo "  -p, --production   Build for production (minified)"
            echo "  -s, --skip-tests   Skip running tests before build"
            echo "      --pack         Create npm tarball after build"
            echo "  -h, --help         Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Clean build directory
if [ "$CLEAN" = true ] || [ ! -d "dist" ]; then
    echo "🧹 Cleaning build directory..."
    rm -rf dist
    echo ""
fi

# Run tests (unless skipped)
if [ "$SKIP_TESTS" = false ]; then
    echo "🧪 Running tests..."
    npm test
    echo ""
fi

# Run linting
echo "🔍 Running linter..."
npm run lint 2>/dev/null || echo "  (no lint script configured)"
echo ""

# Build TypeScript
echo "🔨 Compiling TypeScript..."
if [ "$PRODUCTION" = true ]; then
    NODE_ENV=production npx tsc
else
    npx tsc
fi
echo "  ✓ TypeScript compiled"

# Copy assets
echo "📋 Copying assets..."
mkdir -p dist/nodes/Passport

# Copy icon
if [ -f "nodes/Passport/passport.svg" ]; then
    cp nodes/Passport/passport.svg dist/nodes/Passport/
    echo "  ✓ Icon copied"
fi

# Copy any JSON files
find nodes -name "*.json" -exec cp {} dist/{} \; 2>/dev/null || true

echo ""
echo "📊 Build summary:"
echo "  - Output directory: dist/"
du -sh dist/ 2>/dev/null || echo "  - Size: calculating..."

# Count compiled files
JS_COUNT=$(find dist -name "*.js" | wc -l)
echo "  - JavaScript files: $JS_COUNT"

# Create npm package
if [ "$PACK" = true ]; then
    echo ""
    echo "📦 Creating npm package..."
    npm pack
    TARBALL=$(ls -t *.tgz | head -1)
    echo "  ✓ Created: $TARBALL"
fi

echo ""
echo "================================================"
echo "  Build completed successfully!"
echo "================================================"
echo ""
echo "Next steps:"
echo "  - Test locally: ./scripts/install-local.sh"
echo "  - Publish: npm publish"
