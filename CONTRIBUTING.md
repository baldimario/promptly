# Contributing to Promptly

Thank you for your interest in contributing to Promptly! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/promptly.git
   cd promptly
   ```
3. **Set up the development environment**:
   ```bash
   make setup
   ```
4. **Start the application**:
   ```bash
   make start
   ```

## Development Workflow

1. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and test them thoroughly

3. **Commit your changes** with a clear and descriptive commit message:
   ```bash
   git commit -m "Add feature: description of your changes"
   ```

4. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a pull request** from your branch to the main repository

## Pull Request Guidelines

- **Follow the coding style** of the project
- **Write tests** for your changes when applicable
- **Document new code** based on the project's documentation style
- **Update the README.md** if necessary
- **Make sure all tests pass** before submitting your PR
- **Keep your PR focused** on a single topic to make review easier

## Database Changes

When making changes to the database schema:

1. **Update the Prisma schema** in `app/prisma/schema.prisma`
2. **Create a migration**:
   ```bash
   make db-migrate
   ```
3. **Include the generated migration files** in your pull request

## Code Style Guidelines

- Use TypeScript for type safety
- Follow the existing code style and structure
- Use meaningful variable and function names
- Keep functions small and focused on a single task
- Comment complex code sections
- Use React hooks appropriately

## Testing

- Write tests for new features
- Update tests for modified features
- Run the existing test suite to ensure everything still works

## Documentation

- Update documentation when adding or changing features
- Document props for React components
- Add JSDoc comments for functions and methods
- Keep README and other documentation up to date

## Reporting Issues

When reporting issues, please include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots or GIFs if applicable
- Your environment details (OS, browser, etc.)

## Feature Requests

For feature requests, provide:

- A clear and descriptive title
- Detailed explanation of the feature
- Any relevant examples or mockups
- Justification for why this feature would be valuable to the project

Thank you for contributing to Promptly!
