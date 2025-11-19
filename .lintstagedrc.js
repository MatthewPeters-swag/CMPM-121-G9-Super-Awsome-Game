export default {
  // Lint and format JS files
  // lint-staged automatically respects .gitignore, so node_modules/dist/build won't be processed
  '*.js': ['eslint --fix --max-warnings=0', 'prettier --write'],
  // Format JSON and MD files
  '*.{json,md}': ['prettier --write'],
};
