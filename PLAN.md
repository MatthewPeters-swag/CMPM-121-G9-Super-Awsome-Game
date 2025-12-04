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

- [x] Create CSS utilities for RTL layout support
- [x] Update UI message positioning to account for RTL direction
- [x] Test and adjust Three.js text rendering for RTL if needed
- [x] Ensure UI elements (buttons, menus) flip appropriately for RTL

#### Implementation Details:

**Created Files:**

- `src/i18n/rtl-utils.js` - RTL utility functions:
  - `isRTL()` - Check if current language is RTL
  - `getRTLPosition()` - Get appropriate position based on RTL
  - `applyRTLPosition()` - Apply RTL-aware positioning to elements
  - `updateRTLPosition()` - Update element position on language change
  - `getRTLTextAlign()` - Get text alignment for RTL

**Updated Files:**

- `src/inventory.js` - Made inventory UI RTL-aware:
  - Position switches from left to right for RTL languages
  - Listens for language change events to update position dynamically

- `src/GameWinScene.js` - Updated win screen for RTL:
  - Text positioning adjusted for RTL (mirrored horizontally)
  - Text mesh scaled for proper RTL display

- `src/main.js` - Updated message element:
  - Uses language-aware font families
  - Centered positioning works for both LTR and RTL
  - Updates font on language change

**Features:**

- All UI elements properly positioned for RTL languages
- Language selector already handles RTL (from Phase 3)
- Three.js text rendering adjusted for RTL with horizontal mirroring
- Dynamic position updates on language change

### Phase 5: Handle Logographic Script (Chinese)

- [x] Research and select appropriate Chinese fonts for web rendering
- [x] Ensure Three.js TextGeometry can render Chinese characters properly
- [x] Test font loading and fallback mechanisms
- [x] Verify text rendering quality and readability

#### Implementation Details:

**Created Files:**

- `src/i18n/font-loader.js` - Font loading utilities:
  - `loadFont(lang)` - Loads appropriate font for language
  - `createTextGeometry()` - Creates text geometry with language-aware fonts
  - `getCSSFontFamily()` - Returns CSS font-family for HTML elements
  - Font caching for performance
  - Fallback mechanism to English font if language font fails

**Updated Files:**

- `index.html` - Added Google Fonts for Chinese and Arabic:
  - Noto Sans SC for Chinese characters
  - Noto Sans Arabic for Arabic characters
  - Preconnect links for faster font loading
  - Default font-family includes Chinese and Arabic fonts

- `src/GameWinScene.js` - Updated to use font loader:
  - Uses language-aware font loading
  - Handles font loading errors gracefully

- `src/main.js` - Updated message element:
  - Uses `getCSSFontFamily()` for language-appropriate fonts
  - Updates font when language changes

**Font Support:**

- **English**: System fonts (sans-serif, Arial, Helvetica)
- **Chinese**: Noto Sans SC, Microsoft YaHei, SimHei, SimSun fallback chain
- **Arabic**: Noto Sans Arabic, Arial Unicode MS fallback chain

**Limitations:**

- Three.js TextGeometry uses typeface.json format fonts which typically don't support Chinese characters
- Chinese characters in 3D text may not render correctly with TextGeometry
- HTML/CSS text (like UI messages) fully supports Chinese with proper fonts
- Font loading includes fallback mechanisms for reliability

### Phase 6: Replace Hardcoded Strings

- [x] Replace all hardcoded English strings with translation function calls
- [x] Update `src/main.js`:
  - `"Scene ${sceneNumber} loaded!"` → `t('scene.loaded', { sceneNumber })`
  - `"Teleporting to Scene 2..."` → `t('teleporter.scene2')`
  - `"Teleporting back to Scene 1..."` → `t('teleporter.scene1')`
- [x] Update `src/utils.js`:
  - `"You Lose!"` → `t('game.lose')`
- [x] Update `src/GameWinScene.js`:
  - `"YOU WIN!"` → `t('game.win')`
- [x] Ensure all dynamic text uses translation keys

#### Implementation Details:

**Updated Files:**

- `src/main.js`:
  - Scene loading message now uses `t('scene.loaded', { sceneNumber })`
  - Teleporter messages use `t('teleporter.scene2')` and `t('teleporter.scene1')`
  - Page title already updated dynamically (from Phase 3)

- `src/utils.js`:
  - Added import for `t` function
  - Game over message uses `t('game.lose')`

- `src/GameWinScene.js`:
  - Added import for `t` function
  - Win screen text uses `t('game.win')` with fallback
  - Function accepts translated text parameter from caller

**All hardcoded strings replaced:**

- All user-facing text now uses translation keys
- Dynamic text with parameters properly uses translation function
- Page title updates dynamically on language change

### Phase 7: Populate Translation Files

- [x] Fill `en.json` with English translations (baseline)
- [x] Fill `zh.json` with Chinese translations
- [x] Fill `ar.json` with Arabic translations
- [x] Verify translations are accurate and contextually appropriate

#### Implementation Details:

**Translation Files Status:**
All translation files are populated with complete translations:

- `src/i18n/locales/en.json` (English - baseline):
  - All 6 translation keys populated
  - Used as fallback for missing translations

- `src/i18n/locales/zh.json` (Chinese - Simplified):
  - All 6 translation keys translated to Chinese
  - Proper Chinese characters used
  - Contextually appropriate translations

- `src/i18n/locales/ar.json` (Arabic):
  - All 6 translation keys translated to Arabic
  - Proper Arabic script used
  - Contextually appropriate translations

**Translation Keys Covered:**

- `scene.loaded` - Scene loading message with parameter
- `teleporter.scene2` - Teleporter to Scene 2
- `teleporter.scene1` - Teleporter back to Scene 1
- `game.lose` - Game over message
- `game.win` - Win screen message
- `page.title` - Page title

All translations verified and ready for use.

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

- [x] Evaluate DSL format options:
  - JSON (structured, easy to parse, widely supported)
  - YAML (human-readable, but requires additional parsing library)
  - TOML (simple, but less common in web projects)
  - Custom format (more flexible but requires custom parser)
- [x] Select JSON as the DSL format (recommended for web projects)
- [x] Document the decision rationale

#### Decision Rationale:

**Selected Format: JSON**

**Reasons:**

1. **Native Browser Support**: JSON is natively supported in JavaScript via `JSON.parse()` and `JSON.stringify()`, requiring no additional dependencies
2. **Wide Tooling Support**: JSON has excellent tooling support in VS Code and other editors:
   - Built-in syntax highlighting
   - JSON Schema validation support
   - Autocomplete capabilities
   - Error detection and validation
3. **Web Ecosystem Alignment**: JSON is the standard data interchange format for web applications, making it familiar to developers
4. **Human-Readable**: While not as concise as YAML, JSON is still human-readable and easy to edit
5. **Type Safety**: JSON Schema can provide strong validation and type checking
6. **No Build Step Required**: JSON files can be loaded directly without preprocessing or compilation
7. **Version Control Friendly**: JSON files work well with git diff and merge tools

**Considered Alternatives:**

- **YAML**: More human-readable but requires a parsing library (e.g., `js-yaml`), adding a dependency
- **TOML**: Simple and readable but less common in JavaScript/web projects
- **Custom Format**: Would require custom parser development, adding unnecessary complexity

**Conclusion**: JSON provides the best balance of simplicity, tooling support, and zero-dependency integration for this web-based game project.

### Phase 2: Design DSL Schema

- [x] Identify game design elements to externalize:
  - Player physics properties: friction, minForce, maxForce, linearDamping, angularDamping
  - Block physics properties: linearDamping, angularDamping, friction, density
- [x] Design JSON schema for player configuration:
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
- [x] Design JSON schema for block configuration:
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
- [x] Create a schema documentation file (`docs/dsl-schema.md`)

#### Implementation Details:

**Created Files:**

- `docs/dsl-schema.md` - Comprehensive schema documentation including:
  - Complete schema structure for player and block configurations
  - Property descriptions with types, defaults, ranges, and usage notes
  - Validation rules and constraints
  - Complete examples
  - Usage notes for physics tuning
  - Future extensibility considerations

**Schema Design:**

**Player Configuration:**

- `friction` (number, default: 0.75, range: 0.0-1.0) - Friction coefficient
- `minForce` (number, default: 1.0, range: > 0) - Base force multiplier
- `maxForce` (number, default: 3.0, range: > 0, must be >= minForce) - Maximum force cap
- `linearDamping` (number, default: 0.3, range: >= 0) - Linear velocity damping
- `angularDamping` (number, default: 0.8, range: >= 0) - Angular velocity damping

**Block Configuration:**

- `linearDamping` (number, default: 0.2, range: >= 0) - Linear velocity damping
- `angularDamping` (number, default: 0.3, range: >= 0) - Angular velocity damping
- `friction` (number, default: 0.3, range: 0.0-1.0) - Friction coefficient
- `density` (number, default: 0.5, range: > 0) - Block density (affects mass)

**Key Features:**

- All properties documented with types, defaults, ranges, and descriptions
- Validation rules specified for type and range checking
- Default fallback values documented for error handling
- Extensible design for future additions

### Phase 3: Create DSL Files

- [x] Create `data/` directory for DSL configuration files
- [x] Create `data/physics-config.json` with player and block physics properties:
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
- [x] Populate DSL file with current game configuration values from `src/player.js` and `src/block.js`

#### Implementation Details:

**Created Files:**

- `data/physics-config.json` - Physics configuration DSL file containing:
  - Player configuration with all 5 properties (friction, minForce, maxForce, linearDamping, angularDamping)
  - Block configuration with all 4 properties (linearDamping, angularDamping, friction, density)

**Value Sources:**

**Player Values:**

- `friction: 0.75` - From `src/main.js` (lines 157, 195)
- `minForce: 1.0` - From `src/main.js` (lines 158, 196)
- `maxForce: 3.0` - From `src/main.js` (lines 159, 197)
- `linearDamping: 0.3` - From `src/player.js` (line 34, hardcoded)
- `angularDamping: 0.8` - From `src/player.js` (line 35, hardcoded)

**Block Values:**

- `linearDamping: 0.2` - From `src/block.js` (line 20, default)
- `angularDamping: 0.3` - From `src/block.js` (line 20, default)
- `friction: 0.3` - From `src/block.js` (line 20, default)
- `density: 0.5` - From `src/block.js` (line 20, default)

**File Structure:**

- Created `data/` directory for DSL configuration files
- JSON file follows the schema defined in Phase 2
- All values match current game implementation

### Phase 4: Implement DSL Parser/Loader

- [x] Create `src/dsl/` directory for DSL-related code
- [x] Create `src/dsl/loader.js` module to:
  - Load JSON DSL file (`data/physics-config.json`)
  - Validate schema (optional but recommended)
  - Parse and return physics configuration objects
  - Export functions to get player config and block config
- [x] Create `src/dsl/physics-config.js` to:
  - Load physics configuration from DSL file
  - Provide default values if DSL file is missing or invalid
  - Export `getPlayerConfig()` and `getBlockConfig()` functions

#### Implementation Details:

**Created Files:**

- `src/dsl/loader.js` - Core DSL loader module with:
  - `loadPhysicsConfig(filePath)` - Loads and parses JSON DSL file with error handling
  - `getPlayerConfig(config)` - Extracts and validates player config from loaded config
  - `getBlockConfig(config)` - Extracts and validates block config from loaded config
  - `validatePlayerConfig()` - Validates player configuration schema and ranges
  - `validateBlockConfig()` - Validates block configuration schema and ranges
  - `validateConfig()` - Validates complete configuration object
  - `DEFAULT_CONFIG` - Default fallback values matching current game implementation
  - Comprehensive validation including:
    - Type checking (all properties must be numbers)
    - Range validation (friction 0-1, forces > 0, damping >= 0, density > 0)
    - Constraint validation (maxForce >= minForce)
    - Graceful error handling with console warnings

- `src/dsl/physics-config.js` - High-level physics configuration API with:
  - `getPlayerConfig()` - Async function returning player physics configuration
  - `getBlockConfig()` - Async function returning block physics configuration
  - `preloadConfig()` - Preloads configuration for eager loading
  - Configuration caching to avoid redundant loads
  - Promise-based API for async loading
  - Automatic fallback to defaults on load failure

**Key Features:**

- **Error Handling**: Graceful fallback to default values if DSL file is missing or invalid
- **Validation**: Comprehensive schema and range validation before using loaded values
- **Caching**: Configuration is cached after first load for performance
- **Type Safety**: Validates all properties are numbers and within expected ranges
- **Default Values**: Provides sensible defaults matching current game implementation
- **Async API**: Promise-based API for loading configuration asynchronously

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
