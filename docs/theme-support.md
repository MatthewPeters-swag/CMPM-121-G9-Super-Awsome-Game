# Light and Dark Mode Theme Support

## Overview

The game now supports light and dark mode visual styles that automatically respond to the user's system preferences. The theme system detects the operating system's color scheme preference and applies the appropriate theme automatically.

## Features

- **Automatic Detection**: The theme automatically detects `prefers-color-scheme` from the operating system
- **Real-time Switching**: System theme changes are detected and applied immediately
- **Comprehensive Styling**: All UI elements respond to theme changes including:
  - Move counter
  - Undo button
  - Message notifications
  - Inventory slots and items
  - Win/lose screen text and buttons
- **Smooth Transitions**: Color changes use CSS transitions for a smooth visual update
- **Accessible Colors**: All colors are chosen for proper contrast and readability in both modes

## Theme Colors

### Light Mode

- **Background**: Bright white/light colors for UI elements
- **Text**: Dark text for good readability
- **Borders**: Light gray to define UI boundaries
- **Buttons**: Light backgrounds with dark text

### Dark Mode

- **Background**: Dark colors for UI elements
- **Text**: Light/bright text for good readability
- **Borders**: Lighter gray/white for definition
- **Buttons**: Dark backgrounds with light text

## Implementation Details

### Core Files Modified

1. **`src/theme.js`** (New)
   - Main theme management module
   - Handles theme detection and switching
   - Provides `getThemeColor()` function to retrieve colors
   - Dispatches `themeChanged` events when theme switches

2. **`src/main.js`**
   - Initializes theme system on startup
   - Updates UI element styles using theme colors
   - Listens for theme changes and updates styles

3. **`src/inventory.js`**
   - Inventory slots use theme colors
   - Responds to theme changes dynamically

4. **`src/GameWinScene.js`**
   - Win screen text colors respond to theme
   - Victory message colors adjusted for visibility

5. **`src/GameLoseScene.js`**
   - Lose screen text colors respond to theme
   - Retry button uses theme colors

6. **`index.html`**
   - Added CSS variables for theme colors
   - Added `data-theme` attribute support
   - Smooth transitions for theme switching

## Usage

### For Users

- The game automatically uses the system's light/dark mode preference
- On most operating systems, this can be changed in:
  - **Windows**: Settings → Personalization → Colors
  - **macOS**: System Preferences → General → Appearance
  - **Linux**: System Settings or desktop environment preferences
  - **Android/iOS**: Device settings

### For Developers

#### Adding a New Themed Element

```javascript
import { getThemeColor } from './theme.js';

// Get current theme color
const bgColor = getThemeColor('backgroundColor');
const textColor = getThemeColor('textColor');

// Apply to element
element.style.background = bgColor;
element.style.color = textColor;
```

#### Listening for Theme Changes

```javascript
// Listen for theme changes
window.addEventListener('themeChanged', event => {
  console.log('Theme changed to:', event.detail.theme);
  // Update your UI here
});
```

#### Available Color Keys

- `backgroundColor` - Main UI background
- `backgroundColorTransparent` - Semi-transparent background
- `textColor` - Primary text color
- `borderColor` - Standard borders
- `borderColorBright` - Bright borders for emphasis
- `buttonBg` - Button background
- `buttonBgHover` - Button background on hover
- `buttonBorder` - Button border
- `buttonBorderHover` - Button border on hover
- `inventoryBg` - Inventory background
- `inventoryBorder` - Inventory border
- `slotBg` - Inventory slot background
- `messageBg` - Message notification background
- `messageBorder` - Message notification border
- `winTextColor` - Win screen text color
- `winTextStroke` - Win screen text stroke
- `loseTextColor` - Lose screen text color
- `loseTextStroke` - Lose screen text stroke
- `moveCountTextColor` - Move counter text color
- `moveCountTextStroke` - Move counter text stroke

## Technical Details

### CSS Variables

All theme colors are defined as CSS custom properties (variables) in `:root`:

```css
--theme-backgroundColor
--theme-textColor
--theme-borderColor
/* ... etc */
```

### Media Query Detection

The system uses `window.matchMedia('(prefers-color-scheme: dark)')` to detect user preferences and automatically responds to system theme changes.

### Performance

- Theme changes use efficient CSS transitions (300ms)
- Colors are cached and only updated when needed
- Event-driven architecture minimizes unnecessary re-renders
