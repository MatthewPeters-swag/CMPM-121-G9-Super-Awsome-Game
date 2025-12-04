# DSL Usage Guide

This guide explains how to use and edit the physics configuration DSL (Domain-Specific Language) for the game.

## Overview

The physics configuration DSL allows you to modify game physics properties without changing code. All physics settings are defined in a single JSON file: `public/data/physics-config.json`.

## File Location

The DSL configuration file is located at:

```
public/data/physics-config.json
```

## Editing the Configuration

### Using VS Code (Recommended)

VS Code provides excellent support for editing JSON files with schema validation:

1. **Open the file**: Open `public/data/physics-config.json` in VS Code
2. **Autocomplete**: Start typing a property name and VS Code will suggest available properties
3. **Validation**: Invalid values will be highlighted with red squiggles
4. **Hover for Help**: Hover over any property to see its description and valid range
5. **Format**: Right-click and select "Format Document" to auto-format the JSON

### Schema Validation

The JSON schema is automatically associated with `physics-config.json` through VS Code workspace settings (`.vscode/settings.json`). This provides:

- **Type checking**: Ensures all values are numbers
- **Range validation**: Validates that values are within acceptable ranges
- **Required properties**: Highlights missing required properties
- **Autocomplete**: Suggests available properties as you type
- **Documentation**: Shows descriptions and examples on hover

### Manual Editing

You can also edit the file with any text editor. The file must be valid JSON:

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

## Configuration Properties

### Player Properties

| Property         | Type   | Range            | Default | Description                                 |
| ---------------- | ------ | ---------------- | ------- | ------------------------------------------- |
| `friction`       | number | 0.0 - 1.0        | 0.75    | Friction coefficient. Higher = less sliding |
| `minForce`       | number | > 0              | 1.0     | Base force multiplier for movement          |
| `maxForce`       | number | > 0, >= minForce | 3.0     | Maximum force cap for far clicks            |
| `linearDamping`  | number | >= 0             | 0.3     | Linear velocity damping (air resistance)    |
| `angularDamping` | number | >= 0             | 0.8     | Rotational velocity damping                 |

### Block Properties

| Property         | Type   | Range     | Default | Description                  |
| ---------------- | ------ | --------- | ------- | ---------------------------- |
| `linearDamping`  | number | >= 0      | 0.2     | Linear velocity damping      |
| `angularDamping` | number | >= 0      | 0.3     | Rotational velocity damping  |
| `friction`       | number | 0.0 - 1.0 | 0.3     | Friction coefficient         |
| `density`        | number | > 0       | 0.5     | Block density (affects mass) |

## Examples

### Making the Player More Responsive

Increase movement force and reduce damping:

```json
{
  "player": {
    "friction": 0.8,
    "minForce": 1.5,
    "maxForce": 4.0,
    "linearDamping": 0.2,
    "angularDamping": 0.6
  }
}
```

### Making Blocks Heavier and Less Slippery

Increase density and friction:

```json
{
  "block": {
    "linearDamping": 0.3,
    "angularDamping": 0.4,
    "friction": 0.6,
    "density": 1.0
  }
}
```

### Ice-Like Physics

Reduce friction and damping:

```json
{
  "player": {
    "friction": 0.1,
    "minForce": 1.0,
    "maxForce": 3.0,
    "linearDamping": 0.1,
    "angularDamping": 0.2
  },
  "block": {
    "linearDamping": 0.1,
    "angularDamping": 0.1,
    "friction": 0.1,
    "density": 0.3
  }
}
```

## Validation

### Runtime Validation

The game automatically validates the configuration when it loads:

- **Invalid values**: Replaced with defaults
- **Missing properties**: Filled with defaults
- **Type errors**: Corrected automatically
- **Warnings**: Logged to browser console

### Schema Validation (VS Code)

VS Code validates the file as you edit:

- **Red squiggles**: Indicate invalid values
- **Yellow warnings**: Suggest improvements
- **Autocomplete**: Prevents typos in property names

## Troubleshooting

### Configuration Not Loading

If your changes don't take effect:

1. **Check file location**: Ensure file is at `public/data/physics-config.json`
2. **Validate JSON**: Check for syntax errors (missing commas, brackets, etc.)
3. **Check browser console**: Look for error messages
4. **Hard refresh**: Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

### Invalid Values

If you see validation errors:

1. **Check ranges**: Ensure values are within specified ranges
2. **Check types**: All values must be numbers (not strings)
3. **Check constraints**: `maxForce` must be >= `minForce`
4. **Use defaults**: Remove invalid properties to use defaults

### VS Code Not Showing Autocomplete

If autocomplete doesn't work:

1. **Check settings**: Ensure `.vscode/settings.json` exists
2. **Reload window**: Press Ctrl+Shift+P (Cmd+Shift+P on Mac) → "Reload Window"
3. **Check schema path**: Verify schema file exists at `public/data/schemas/physics-config.schema.json`

## Best Practices

1. **Test incrementally**: Make small changes and test the game
2. **Use version control**: Commit changes to track iterations
3. **Document changes**: Add comments in commit messages explaining why values were changed
4. **Backup defaults**: Keep a copy of default values for reference
5. **Validate before committing**: Ensure JSON is valid before committing

## Advanced Usage

### Multiple Configurations

You can create multiple configuration files for different game modes:

- `physics-config-easy.json` - Easier physics
- `physics-config-hard.json` - Harder physics
- `physics-config-test.json` - Testing values

Then modify `src/dsl/physics-config.js` to load different files based on game mode.

### Programmatic Access

You can access the configuration programmatically:

```javascript
import { getPlayerConfig, getBlockConfig } from './dsl/physics-config.js';

const playerConfig = await getPlayerConfig();
console.log('Player friction:', playerConfig.friction);
```

## See Also

- [DSL Schema Documentation](./dsl-schema.md) - Complete schema reference
- [PLAN.md](../PLAN.md) - Implementation plan and architecture
