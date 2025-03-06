# Contributing to BeckDash

Thank you for considering contributing to BeckDash! This document outlines the process for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the Issues section
- Use the bug report template when creating a new issue
- Include detailed steps to reproduce the bug
- Include screenshots if applicable
- Describe what you expected to happen and what actually happened

### Suggesting Features

- Check if the feature has already been suggested in the Issues section
- Use the feature request template when creating a new issue
- Provide a clear description of the feature
- Explain why this feature would be useful to most users

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure they pass
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/JordanDebrunner/BeckDash.git
cd BeckDash
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

3. Set up environment variables:
```bash
# Copy example env files
cp .env.example .env
```

4. Start development servers:
```bash
# Start backend
cd server
npm run dev

# Start frontend
cd client
npm run dev
```

## Coding Guidelines

### JavaScript/TypeScript

- Use TypeScript for all new code
- Follow the ESLint configuration in the project
- Write meaningful variable and function names
- Add JSDoc comments for functions and complex code blocks

### CSS/Styling

- Use Tailwind CSS for styling
- Follow the BEM naming convention for custom CSS classes
- Keep styles modular and reusable

### Testing

- Write tests for new features
- Ensure all tests pass before submitting a PR
- Aim for good test coverage

## Git Commit Guidelines

- Use clear and descriptive commit messages
- Reference issue numbers in commit messages when applicable
- Keep commits focused on a single change

## Documentation

- Update documentation when changing functionality
- Document new features
- Keep the README.md up to date

## Review Process

- All PRs require at least one review before merging
- Address review comments promptly
- Be open to feedback and suggestions

Thank you for contributing to BeckDash!