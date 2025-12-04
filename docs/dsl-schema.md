# DSL Schema Documentation

This document describes the JSON schema for the game's physics configuration DSL (Domain-Specific Language).

## Overview

The physics configuration DSL allows game designers to externalize physics properties for game entities without modifying code. This enables rapid iteration on game feel and balance.

## Schema Structure

The DSL uses a single JSON file (`data/physics-config.json`) containing configuration for different game entities.

### Root Structure

```json
{
  "player": { ... },
  "block": { ... }
}
```

## Player Configuration Schema

The `player` object configures physics properties for the player character.

### Properties

| Property         | Type   | Default | Range     | Description                                                                                                 |
| ---------------- | ------ | ------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| `friction`       | number | 0.75    | 0.0 - 1.0 | Friction coefficient between player and surfaces. Higher values make the player slide less.                 |
| `minForce`       | number | 1.0     | > 0       | Base force multiplier for player movement. Scales with click distance.                                      |
| `maxForce`       | number | 3.0     | > 0       | Maximum force cap for far clicks. Prevents excessive force on distant clicks. Must be >= minForce.          |
| `linearDamping`  | number | 0.3     | >= 0      | Linear damping coefficient. Reduces linear velocity over time. Higher values = more resistance to movement. |
| `angularDamping` | number | 0.8     | >= 0      | Angular damping coefficient. Reduces rotational velocity over time. Higher values = less spinning.          |

### Example

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

### Property Details

#### `friction` (number)

- **Purpose**: Controls how much the player slides on surfaces
- **Typical Range**: 0.0 (ice-like) to 1.0 (very grippy)
- **Current Default**: 0.75 (moderately grippy)
- **Usage**: Applied to the player's collider in Rapier physics engine

#### `minForce` (number)

- **Purpose**: Base force multiplier for movement calculations
- **Typical Range**: 0.5 to 2.0
- **Current Default**: 1.0
- **Usage**: Multiplied by click distance to calculate impulse force
- **Note**: Works in conjunction with `maxForce` to create distance-based force scaling

#### `maxForce` (number)

- **Purpose**: Caps the maximum force applied to the player
- **Typical Range**: 2.0 to 5.0
- **Current Default**: 3.0
- **Usage**: Prevents excessive force when clicking far away
- **Constraint**: Should be >= `minForce`

#### `linearDamping` (number)

- **Purpose**: Reduces linear velocity over time (air resistance effect)
- **Typical Range**: 0.0 (no damping) to 1.0 (heavy damping)
- **Current Default**: 0.3 (light damping to maintain momentum)
- **Usage**: Applied to the player's rigid body in Rapier physics engine

#### `angularDamping` (number)

- **Purpose**: Reduces rotational velocity over time
- **Typical Range**: 0.0 (no damping) to 1.0 (heavy damping)
- **Current Default**: 0.8 (high damping to prevent excessive spinning)
- **Usage**: Applied to the player's rigid body in Rapier physics engine

## Block Configuration Schema

The `block` object configures physics properties for movable blocks in the game.

### Properties

| Property         | Type   | Default | Range     | Description                                                         |
| ---------------- | ------ | ------- | --------- | ------------------------------------------------------------------- |
| `linearDamping`  | number | 0.2     | >= 0      | Linear damping coefficient. Reduces linear velocity over time.      |
| `angularDamping` | number | 0.3     | >= 0      | Angular damping coefficient. Reduces rotational velocity over time. |
| `friction`       | number | 0.3     | 0.0 - 1.0 | Friction coefficient between block and surfaces.                    |
| `density`        | number | 0.5     | > 0       | Density of the block. Affects mass and inertia.                     |

### Example

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

### Property Details

#### `linearDamping` (number)

- **Purpose**: Reduces linear velocity over time
- **Typical Range**: 0.0 to 0.5
- **Current Default**: 0.2 (light damping)
- **Usage**: Applied to the block's rigid body in Rapier physics engine

#### `angularDamping` (number)

- **Purpose**: Reduces rotational velocity over time
- **Typical Range**: 0.0 to 0.5
- **Current Default**: 0.3 (moderate damping)
- **Usage**: Applied to the block's rigid body in Rapier physics engine

#### `friction` (number)

- **Purpose**: Controls how much the block slides on surfaces
- **Typical Range**: 0.0 (ice-like) to 1.0 (very grippy)
- **Current Default**: 0.3 (low friction, block slides easily)
- **Usage**: Applied to the block's collider in Rapier physics engine

#### `density` (number)

- **Purpose**: Determines the mass of the block (mass = density × volume)
- **Typical Range**: 0.1 (light) to 2.0 (heavy)
- **Current Default**: 0.5 (moderate weight)
- **Usage**: Applied to the block's collider in Rapier physics engine
- **Note**: Higher density makes blocks harder to push but more stable

## Complete Example

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

## Validation Rules

1. **Type Validation**: All properties must be numbers (not strings or other types)
2. **Range Validation**:
   - `friction`: Must be between 0.0 and 1.0 (inclusive)
   - `minForce`: Must be greater than 0
   - `maxForce`: Must be greater than 0 and >= `minForce`
   - `linearDamping`: Must be >= 0
   - `angularDamping`: Must be >= 0
   - `density`: Must be greater than 0
3. **Required Properties**: All properties listed in the schema are required for each entity
4. **Unknown Properties**: Additional properties are ignored (future extensibility)

## Default Values

If the DSL file is missing, malformed, or contains invalid values, the game will fall back to the default values listed in this schema. This ensures the game remains playable even if configuration is incorrect.

## Usage Notes

- **Physics Tuning**: Adjust these values to fine-tune game feel:
  - Increase `friction` for more control
  - Decrease `linearDamping` for more momentum
  - Adjust `minForce`/`maxForce` to change movement responsiveness
  - Modify block `density` to make puzzles easier or harder

- **Testing**: After modifying values, test thoroughly to ensure:
  - Player movement feels responsive
  - Blocks behave as expected
  - Game balance is maintained
  - No physics glitches occur

- **Version Control**: Commit DSL files to version control to track design iterations and enable team collaboration.

## Future Extensions

The schema is designed to be extensible. Future additions might include:

- Platform properties (friction, bounciness)
- Goal properties (detection radius, visual effects)
- Teleporter properties (cooldown, force)
- Scene-specific overrides
