#!/bin/bash

# Ebook Marketplace Development Setup Script
echo "🚀 Setting up Ebook Marketplace development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d"." -f1 | cut -d"v" -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "🎉 Setup complete!"
echo ""
echo "Available commands:"
echo "  make help       - Show all available commands"
echo "  make dev        - Start development server"
echo "  make build      - Build for production"
echo ""
echo "Next steps:"
echo "1. Run 'make dev' to start the development server"
echo "2. Open http://localhost:3000 in your browser"
