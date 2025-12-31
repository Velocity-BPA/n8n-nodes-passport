#!/bin/bash
#
# n8n-nodes-passport test script
# Copyright (c) 2025 Velocity BPA
# Licensed under BSL 1.1

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "================================================"
echo "  n8n-nodes-passport Test Suite"
echo "================================================"
echo ""

# Parse arguments
COVERAGE=false
WATCH=false
UNIT_ONLY=false
INTEGRATION_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --coverage|-c)
            COVERAGE=true
            shift
            ;;
        --watch|-w)
            WATCH=true
            shift
            ;;
        --unit|-u)
            UNIT_ONLY=true
            shift
            ;;
        --integration|-i)
            INTEGRATION_ONLY=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -c, --coverage      Run tests with coverage report"
            echo "  -w, --watch         Run tests in watch mode"
            echo "  -u, --unit          Run only unit tests"
            echo "  -i, --integration   Run only integration tests"
            echo "  -h, --help          Show this help message"
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
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Build test command
TEST_CMD="npx jest"

if [ "$COVERAGE" = true ]; then
    TEST_CMD="$TEST_CMD --coverage"
fi

if [ "$WATCH" = true ]; then
    TEST_CMD="$TEST_CMD --watch"
fi

if [ "$UNIT_ONLY" = true ]; then
    TEST_CMD="$TEST_CMD test/unit"
    echo "Running unit tests..."
elif [ "$INTEGRATION_ONLY" = true ]; then
    TEST_CMD="$TEST_CMD test/integration"
    echo "Running integration tests..."
else
    echo "Running all tests..."
fi

echo ""
echo "Command: $TEST_CMD"
echo ""

# Run tests
eval "$TEST_CMD"

echo ""
echo "================================================"
echo "  Tests completed!"
echo "================================================"
