# Implementation Plan: i18n/l10n and External DSL

This document outlines the steps needed to implement internationalization/localization (i18n/l10n) support for three languages and an external DSL for game design configuration.

## Goal 1: i18n + l10n Support

Support three different natural languages:

- English (baseline)
- Chinese (中文) - logographic script
- Arabic (العربية) - right-to-left script

### Phase 1: Identify and Extract Text Content

- [x] Audit all source files to identify hardcoded text strings
- [x] Create a list of all user-facing text (UI messages, game state messages, etc.)
- [x] Document text strings found in:
  - `src/main.js`: Scene loading messages, teleporter messages
  - `src/utils.js`: "You Lose!" message
  - `src/GameWinScene.js`: "YOU WIN!" text
  - Any other files with user-visible text

#### Complete List of User-Facing Text Strings:

1. **Scene Loading Message** (`src/main.js:104`)
   - Text: `"Scene ${sceneNumber} loaded!"`
   - Context: Displayed when a scene is loaded
   - Type: Dynamic message with variable (sceneNumber)

2. **Teleporter to Scene 2** (`src/main.js:138`)
   - Text: `"Teleporting to Scene 2..."`
   - Context: Displayed when player enters teleporter in Scene 1
   - Type: Static message

3. **Teleporter to Scene 1** (`src/main.js:176`)
   - Text: `"Teleporting back to Scene 1..."`
   - Context: Displayed when player enters teleporter in Scene 2
   - Type: Static message

4. **Game Over Message** (`src/utils.js:51`)
   - Text: `"You Lose!"`
   - Context: Displayed when player or block falls off platform
   - Type: Static message

5. **Win Screen Text** (`src/GameWinScene.js:13`)
   - Text: `"YOU WIN!"`
   - Context: Displayed as 3D text when player wins the game
   - Type: Static message (rendered with Three.js TextGeometry)

6. **Page Title** (`index.html:5`)
   - Text: `"My first three.js app"`
   - Context: HTML page title (browser tab)
   - Type: Static text

**Total: 6 user-facing text strings identified**

### Phase 2: Create Translation Infrastructure

- [x] Create a new `src/i18n/` directory for internationalization code
- [x] Create `src/i18n/translations.js` module to manage translations
- [x] Create translation JSON files:
  - `src/i18n/locales/en.json` (English - baseline)
  - `src/i18n/locales/zh.json` (Chinese - Simplified)
  - `src/i18n/locales/ar.json` (Arabic)
- [x] Implement a translation function (e.g., `t(key, params)`) that:
  - Accepts a translation key and optional parameters
  - Returns the translated string for the current language
  - Falls back to English if translation is missing

#### Implementation Details:

**Created Files:**

- `src/i18n/translations.js` - Main translation module with:
  - `initTranslations(lang)` - Initialize translation system with language detection
  - `setLanguage(lang)` - Switch language and persist preference
  - `t(key, params)` - Translation function with parameter interpolation
  - `getCurrentLanguage()` - Get current language code
  - `loadPreferredLanguage()` - Load saved language preference
  - Automatic English fallback when translations are missing
  - Browser language detection support
  - localStorage persistence for language preference

**Translation Files:**

- `src/i18n/locales/en.json` - English translations (baseline)
- `src/i18n/locales/zh.json` - Chinese (Simplified) translations
- `src/i18n/locales/ar.json` - Arabic translations

**Translation Keys Structure:**

- `scene.loaded` - Scene loading message (with {{sceneNumber}} parameter)
- `teleporter.scene2` - Teleporter to Scene 2 message
- `teleporter.scene1` - Teleporter back to Scene 1 message
- `game.lose` - Game over message
- `game.win` - Win screen message
- `page.title` - Page title

### Phase 3: Implement Language Detection and Selection

- [x] Detect browser language preference using `navigator.language` or `navigator.languages`
- [x] Create a language selector UI component (dropdown)
- [x] Store selected language preference in `localStorage` for persistence
- [x] Implement language switching functionality that:
  - Updates all displayed text immediately
  - Handles RTL layout changes for Arabic
  - Updates text direction CSS (`dir="rtl"` for Arabic)

#### Implementation Details:

**Created Files:**

- `src/i18n/languageSelector.js` - Language selector UI component with:
  - `createLanguageSelector()` - Creates dropdown UI element
  - `initLanguageSelector()` - Initializes selector and sets up page direction
  - `updatePageDirection()` - Updates HTML `dir` and `lang` attributes for RTL support
  - Automatic positioning adjustment for RTL (left vs right positioning)
  - Language change event dispatching

**Updated Files:**

- `src/i18n/translations.js` - Enhanced `initTranslations()` to:
  - Check localStorage preference first
  - Fall back to browser language detection
  - Fall back to English if unsupported language detected

- `src/main.js` - Integrated i18n system:
  - Imported translation functions and language selector
  - Initialize translations on page load
  - Initialize language selector UI
  - Update page title with translated text
  - Listen for language change events to update page title dynamically

**Features:**

- Language selector dropdown positioned in top-right (top-left for RTL)
- Automatic browser language detection on first visit
- localStorage persistence of language preference
- RTL layout support with `dir="rtl"` attribute on HTML element
- Dynamic language switching with immediate UI updates
- Language change events for other components to listen to

### Phase 4: Handle Right-to-Left (RTL) Layout

- [ ] Create CSS utilities for RTL layout support
- [ ] Update UI message positioning to account for RTL direction
- [ ] Test and adjust Three.js text rendering for RTL if needed
- [ ] Ensure UI elements (buttons, menus) flip appropriately for RTL

### Phase 5: Handle Logographic Script (Chinese)

- [ ] Research and select appropriate Chinese fonts for web rendering
- [ ] Ensure Three.js TextGeometry can render Chinese characters properly
- [ ] Test font loading and fallback mechanisms
- [ ] Verify text rendering quality and readability

### Phase 6: Replace Hardcoded Strings

- [ ] Replace all hardcoded English strings with translation function calls
- [ ] Update `src/main.js`:
  - `"Scene ${sceneNumber} loaded!"` → `t('scene.loaded', { sceneNumber })`
  - `"Teleporting to Scene 2..."` → `t('teleporter.scene2')`
  - `"Teleporting back to Scene 1..."` → `t('teleporter.scene1')`
- [ ] Update `src/utils.js`:
  - `"You Lose!"` → `t('game.lose')`
- [ ] Update `src/GameWinScene.js`:
  - `"YOU WIN!"` → `t('game.win')`
- [ ] Ensure all dynamic text uses translation keys

### Phase 7: Populate Translation Files

- [ ] Fill `en.json` with English translations (baseline)
- [ ] Fill `zh.json` with Chinese translations
- [ ] Fill `ar.json` with Arabic translations
- [ ] Verify translations are accurate and contextually appropriate

### Phase 8: Testing

- [ ] Test language switching between all three languages
- [ ] Verify RTL layout works correctly for Arabic
- [ ] Verify Chinese characters render correctly
- [ ] Test font loading and fallback scenarios
- [ ] Verify all game states display correct translations
- [ ] Test on different browsers and devices

---

## Goal 2: External DSL for Game Design

Use an external DSL to define important design details in the game, with tool support (syntax highlighting).

### Phase 1: Choose DSL Format

- [ ] Evaluate DSL format options:
  - JSON (structured, easy to parse, widely supported)
- [ ] Select JSON as the DSL format (recommended for web projects)
- [ ] Document the decision rationale

### Phase 2: Design DSL Schema

- [ ] Identify game design elements to externalize:
  - Player physics properties: friction, minForce, maxForce, linearDamping, angularDamping
  - Block physics properties: linearDamping, angularDamping, friction, density
- [ ] Design JSON schema for player configuration:
  ```json
  {
    "player": {
      "friction": 0.75,
      "minForce": 1.0,
      "maxForce": 3.0,
      "linearDamping": 0.3,
      "angularDamping": 0.8
    }
  }
  ```
- [ ] Design JSON schema for block configuration:
  ```json
  {
    "block": {
      "linearDamping": 0.2,
      "angularDamping": 0.3,
      "friction": 0.3,
      "density": 0.5
    }
  }
  ```
- [ ] Create a schema documentation file (`docs/dsl-schema.md`)

### Phase 3: Create DSL Files

- [ ] Create `data/` directory for DSL configuration files
- [ ] Create `data/physics-config.json` with player and block physics properties:
  ```json
  {
    "player": {
      "friction": 0.75,
      "minForce": 1.0,
      "maxForce": 3.0,
      "linearDamping": 0.3,
      "angularDamping": 0.8
    },
    "block": {
      "linearDamping": 0.2,
      "angularDamping": 0.3,
      "friction": 0.3,
      "density": 0.5
    }
  }
  ```
- [ ] Populate DSL file with current game configuration values from `src/player.js` and `src/block.js`

### Phase 4: Implement DSL Parser/Loader

- [ ] Create `src/dsl/` directory for DSL-related code
- [ ] Create `src/dsl/loader.js` module to:
  - Load JSON DSL file (`data/physics-config.json`)
  - Validate schema (optional but recommended)
  - Parse and return physics configuration objects
  - Export functions to get player config and block config
- [ ] Create `src/dsl/physics-config.js` to:
  - Load physics configuration from DSL file
  - Provide default values if DSL file is missing or invalid
  - Export `getPlayerConfig()` and `getBlockConfig()` functions

### Phase 5: Refactor Game Code to Use DSL

- [ ] Import DSL loader in `src/main.js`
- [ ] Update `loadScene1()` to load player config from DSL:
  - Replace hardcoded `{ friction: 0.75, minForce: 1.0, maxForce: 3.0 }` with DSL-loaded config
  - Update `Player` constructor call to include `linearDamping` and `angularDamping` from DSL
- [ ] Update `loadScene2()` to load player config from DSL:
  - Replace hardcoded `{ friction: 0.75, minForce: 1.0, maxForce: 3.0 }` with DSL-loaded config
  - Update `Player` constructor call to include `linearDamping` and `angularDamping` from DSL
- [ ] Update `src/player.js` to accept `linearDamping` and `angularDamping` in config:
  - Extract `linearDamping` and `angularDamping` from config with defaults (0.3 and 0.8)
  - Use these values in `setLinearDamping()` and `setAngularDamping()` calls instead of hardcoded values
- [ ] Update `loadScene1()` to load block config from DSL:
  - Replace hardcoded block constructor defaults with DSL-loaded config
- [ ] Ensure backward compatibility by providing defaults if DSL loading fails

### Phase 6: Create Tool Support (Syntax Highlighting)

- [ ] Create `data/.vscode/settings.json` for VS Code workspace settings
- [ ] Configure JSON schema association:
  - Link `data/physics-config.json` to a JSON schema
  - Enable JSON schema validation in VS Code
- [ ] Create `data/schemas/physics-config.schema.json` (JSON Schema file):
  - Define structure for physics configuration DSL
  - Add descriptions and type information for player properties (friction, minForce, maxForce, linearDamping, angularDamping)
  - Add descriptions and type information for block properties (linearDamping, angularDamping, friction, density)
  - Enable autocomplete and validation
  - Include example values and ranges where appropriate
- [ ] Document how to use schema validation in `docs/dsl-usage.md`

### Phase 7: Enhanced Tool Support (Optional)

- [ ] Create a simple DSL validator script (`scripts/validate-dsl.js`) that:
  - Validates `data/physics-config.json` against the schema
  - Checks that all required properties are present
  - Validates numeric ranges (e.g., friction should be 0-1, forces should be positive)
- [ ] Add validation to build process (optional)
- [ ] Create example DSL files demonstrating different physics configurations
- [ ] Document DSL best practices and patterns for physics tuning

### Phase 8: Testing and Documentation

- [ ] Test loading physics configuration from DSL file
- [ ] Verify player movement and physics behavior with DSL-loaded config
- [ ] Verify block physics behavior with DSL-loaded config
- [ ] Test that game functionality works correctly with modified DSL values
- [ ] Test schema validation catches invalid DSL files (missing properties, wrong types, etc.)
- [ ] Update README.md with DSL documentation
- [ ] Create example DSL files demonstrating different physics configurations
- [ ] Document how to modify player and block physics properties through DSL file

---

## Integration Considerations

- [ ] Plan for DSL validation errors to show helpful messages
- [ ] Consider versioning DSL schema for future compatibility
- [ ] Ensure DSL loader handles missing or malformed files gracefully with fallback defaults

---

## Notes

- Both goals can be implemented independently, but consider integration points
- DSL format choice (JSON) aligns well with web ecosystem and tooling
- i18n system should be extensible for adding more languages in the future
- DSL should be designed to be human-readable and easy to edit
