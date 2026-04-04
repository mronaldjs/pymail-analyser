# Contributing to PyMail Analyser

Thank you for your interest in contributing to PyMail Analyser! We appreciate all contributions, whether they're bug reports, feature requests, or code improvements.

## How to Contribute

### 1. Report Bugs or Request Features

- Open an [Issue](https://github.com/mronaldjs/pymail-analyser/issues) with a clear description
- Include relevant details like your environment, steps to reproduce (for bugs), or use cases (for features)
- Check existing issues to avoid duplicates

### 2. Development Setup

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/pymail-analyser.git
   cd pymail-analyser
   ```

3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Install dependencies**:
   
   **Backend**:
   ```bash
   cd pymail-api
   pip install -r requirements.txt
   ```
   
   **Frontend**:
   ```bash
   cd pymail-webapp
   npm install
   ```

### 3. Making Changes

- **Follow the existing code style**: The project uses automated formatting tools
- **Add tests** for new features or bug fixes
- **Update documentation** if you change behavior or add features
- **Keep commits atomic**: Each commit should represent a logical change

### 4. Testing

**Backend**:
```bash
cd pymail-api
pytest tests/
```

**Frontend**:
```bash
cd pymail-webapp
npm run test
```

**Docker**:
```bash
docker-compose up --build
```

### 5. Submitting a Pull Request

1. **Push your branch** to your fork
2. **Open a PR** against the `master` branch
3. **Write a clear PR description**:
   - What problem does it solve?
   - What changes are made?
   - Any breaking changes?
4. **Ensure CI passes** (tests, linting, etc.)
5. **Respond to review feedback** promptly

## Code Style Guidelines

- **Python**: PEP 8
- **TypeScript/JavaScript**: Follow the ESLint config in the project
- **Commit messages**: Use clear, descriptive messages

## Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
  - Additional email providers support
  - Enhanced detection algorithms
  - UI/UX improvements
- 📚 Documentation improvements
- ♻️ Code refactoring
- 🧪 Additional tests

## Questions?

Feel free to:
- Open a discussion in the [Issues](https://github.com/mronaldjs/pymail-analyser/issues) section
- Reach out on [LinkedIn](https://linkedin.com/in/mronaldjs)

## License

By contributing to PyMail Analyser, you agree that your contributions will be licensed under the MIT License.

---

Happy coding! 🚀
