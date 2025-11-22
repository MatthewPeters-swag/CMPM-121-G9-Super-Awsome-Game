export default {
  // Only lint source files, not config files
  "src/**/*.js": ["eslint --fix", "prettier --write"],

  // Format markdown and json in project root
  "*.md": ["prettier --write"],
  // Only run Prettier on top-level package files, not every JSON (avoids node_modules)
  "package.json": ["prettier --write"],
  "package-lock.json": ["prettier --write"]
};
