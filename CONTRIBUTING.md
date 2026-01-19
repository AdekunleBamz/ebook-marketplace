# Contributing to Ebook Marketplace

Thank you for your interest in contributing to the Ebook Marketplace project! We welcome contributions from the community. This document provides guidelines and information on how to contribute effectively.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)
- [Style Guidelines](#style-guidelines)

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to abide by its terms. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up the development environment (see [Development Setup](#development-setup))
4. Create a new branch for your changes
5. Make your changes
6. Test your changes
7. Submit a pull request

## How to Contribute

### Types of Contributions

- **Bug fixes**: Fix existing issues
- **Features**: Add new functionality
- **Documentation**: Improve or add documentation
- **Tests**: Add or improve tests
- **Code style**: Improve code quality and consistency

### Finding Issues to Work On

- Check the [Issues](https://github.com/AdekunleBamz/ebook-marketplace/issues) page for open issues
- Look for issues labeled `good first issue` or `help wanted`
- Comment on an issue to indicate you're working on it

## Development Setup

1. **Prerequisites**:
   - Node.js (version 18 or higher)
   - npm or yarn
   - Git

2. **Clone and Install**:
   ```bash
   git clone https://github.com/your-username/ebook-marketplace.git
   cd ebook-marketplace
   npm install
   ```

3. **Environment Setup**:
   - Copy `.env.example` to `.env.local`
   - Fill in the required environment variables
   - Set up Supabase (see README.md for details)

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Run Tests**:
   ```bash
   npm test
   ```

## Submitting Changes

1. **Create a Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number-description
   ```

2. **Make Your Changes**:
   - Write clear, concise commit messages
   - Ensure your code follows the style guidelines
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**:
   - Run the test suite
   - Test manually in the browser
   - Ensure no linting errors

4. **Commit Your Changes**:
   ```bash
   git add .
   git commit -m "Brief description of changes"
   ```

5. **Push and Create PR**:
   ```bash
   git push origin your-branch-name
   ```
   Then create a pull request on GitHub.

### Pull Request Guidelines

- Use a clear, descriptive title
- Provide a detailed description of the changes
- Reference any related issues
- Ensure all CI checks pass
- Request review from maintainers

## Reporting Issues

When reporting bugs or requesting features:

1. Check if the issue already exists
2. Use a clear, descriptive title
3. Provide detailed steps to reproduce (for bugs)
4. Include relevant information:
   - Browser/OS version
   - Error messages
   - Screenshots if applicable
5. Use issue templates when available

## Style Guidelines

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic

### Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Keep the first line under 50 characters
- Provide detailed description in the body if needed
- Reference issue numbers when applicable

### Documentation

- Update README.md for significant changes
- Add JSDoc comments for public APIs
- Keep documentation up to date

## Recognition

Contributors will be recognized in the project's README.md and GitHub's contributor insights. Thank you for your contributions!

## Questions?

If you have questions about contributing, feel free to:
- Open a discussion on GitHub
- Contact the maintainers
- Check existing issues and discussions

We appreciate your help in making Ebook Marketplace better!