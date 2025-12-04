# DSL Best Practices and Physics Tuning Guide

This guide provides best practices for tuning physics properties and common patterns for achieving specific gameplay feels.

## Table of Contents

- [General Principles](#general-principles)
- [Player Physics Tuning](#player-physics-tuning)
- [Block Physics Tuning](#block-physics-tuning)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)
- [Workflow Recommendations](#workflow-recommendations)

## General Principles

### 1. **Start with Defaults, Tune Incrementally**

Always start with the default configuration and make small, incremental changes. Large changes make it difficult to identify what caused a problem.

**Good:**

```json
{
  "player": {
    "friction": 0.75, // Default
    "minForce": 1.2, // Small increase from 1.0
    "maxForce": 3.5 // Small increase from 3.0
  }
}
```

**Bad:**

```json
{
  "player": {
    "friction": 0.2, // Huge change from 0.75
    "minForce": 5.0, // 5x increase
    "maxForce": 10.0 // 3x increase
  }
}
```

### 2. **Test After Each Change**

Test the game after each change to ensure it feels right. Don't make multiple changes at once.

### 3. **Understand What Each Property Does**

Before changing a value, understand what it affects:

- **Friction**: How much objects slide on surfaces
- **Force**: How strongly objects move when pushed
- **Damping**: How quickly objects slow down
- **Density**: How heavy objects are (affects mass)

### 4. **Balance Related Properties**

Properties often interact with each other. For example:

- High friction + low damping = grippy but maintains momentum
- Low friction + high damping = slippery but slows quickly
- High force + low damping = very responsive but hard to control

## Player Physics Tuning

### Making the Player More Responsive

**Goal**: Player responds quickly to clicks and moves faster.

**Approach:**

- Increase `minForce` and `maxForce` (more power)
- Decrease `linearDamping` (less air resistance)
- Slightly increase `friction` (better control)

**Example:**

```json
{
  "player": {
    "friction": 0.8,
    "minForce": 1.5,
    "maxForce": 4.0,
    "linearDamping": 0.2,
    "angularDamping": 0.7
  }
}
```

### Making the Player Less Responsive

**Goal**: Player moves slower and requires more deliberate clicks.

**Approach:**

- Decrease `minForce` and `maxForce` (less power)
- Increase `linearDamping` (more air resistance)
- Adjust `friction` based on desired control level

**Example:**

```json
{
  "player": {
    "friction": 0.6,
    "minForce": 0.8,
    "maxForce": 2.5,
    "linearDamping": 0.4,
    "angularDamping": 0.9
  }
}
```

### Making the Player More Controllable

**Goal**: Player stops quickly and doesn't slide around.

**Approach:**

- Increase `friction` (less sliding)
- Increase `linearDamping` (stops faster)
- Increase `angularDamping` (less spinning)

**Example:**

```json
{
  "player": {
    "friction": 0.9,
    "minForce": 1.0,
    "maxForce": 3.0,
    "linearDamping": 0.5,
    "angularDamping": 0.9
  }
}
```

### Making the Player Slippery

**Goal**: Player slides around like on ice.

**Approach:**

- Decrease `friction` (more sliding)
- Decrease `linearDamping` (maintains momentum)
- Decrease `angularDamping` (more spinning)

**Example:**

```json
{
  "player": {
    "friction": 0.1,
    "minForce": 1.0,
    "maxForce": 3.0,
    "linearDamping": 0.1,
    "angularDamping": 0.2
  }
}
```

## Block Physics Tuning

### Making Blocks Easier to Push

**Goal**: Blocks move easily when pushed.

**Approach:**

- Decrease `density` (lighter blocks)
- Decrease `friction` (less resistance)
- Decrease `linearDamping` (maintains momentum)

**Example:**

```json
{
  "block": {
    "linearDamping": 0.15,
    "angularDamping": 0.25,
    "friction": 0.2,
    "density": 0.3
  }
}
```

### Making Blocks Harder to Push

**Goal**: Blocks are heavy and require more effort to move.

**Approach:**

- Increase `density` (heavier blocks)
- Increase `friction` (more resistance)
- Increase `linearDamping` (stops faster)

**Example:**

```json
{
  "block": {
    "linearDamping": 0.4,
    "angularDamping": 0.5,
    "friction": 0.7,
    "density": 1.2
  }
}
```

### Making Blocks Stable

**Goal**: Blocks don't tip over easily.

**Approach:**

- Increase `density` (lower center of gravity effect)
- Increase `angularDamping` (less rotation)
- Increase `friction` (less sliding)

**Example:**

```json
{
  "block": {
    "linearDamping": 0.3,
    "angularDamping": 0.6,
    "friction": 0.8,
    "density": 1.0
  }
}
```

### Making Blocks Slide Easily

**Goal**: Blocks slide smoothly across surfaces.

**Approach:**

- Decrease `friction` (less grip)
- Decrease `linearDamping` (maintains speed)
- Decrease `angularDamping` (can rotate while sliding)

**Example:**

```json
{
  "block": {
    "linearDamping": 0.1,
    "angularDamping": 0.15,
    "friction": 0.1,
    "density": 0.4
  }
}
```

## Common Patterns

### Pattern 1: "Easy Mode" Physics

**Characteristics**: Responsive player, light blocks, high control

```json
{
  "player": {
    "friction": 0.9,
    "minForce": 1.5,
    "maxForce": 4.0,
    "linearDamping": 0.2,
    "angularDamping": 0.7
  },
  "block": {
    "linearDamping": 0.3,
    "angularDamping": 0.4,
    "friction": 0.6,
    "density": 0.3
  }
}
```

### Pattern 2: "Hard Mode" Physics

**Characteristics**: Less responsive player, heavy blocks, low control

```json
{
  "player": {
    "friction": 0.5,
    "minForce": 0.8,
    "maxForce": 2.5,
    "linearDamping": 0.4,
    "angularDamping": 0.9
  },
  "block": {
    "linearDamping": 0.1,
    "angularDamping": 0.2,
    "friction": 0.2,
    "density": 0.8
  }
}
```

### Pattern 3: "Ice Physics"

**Characteristics**: Everything slides around

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
    "linearDamping": 0.05,
    "angularDamping": 0.1,
    "friction": 0.05,
    "density": 0.3
  }
}
```

### Pattern 4: "Heavy Physics"

**Characteristics**: Everything feels weighty and substantial

```json
{
  "player": {
    "friction": 0.85,
    "minForce": 2.0,
    "maxForce": 5.0,
    "linearDamping": 0.4,
    "angularDamping": 0.9
  },
  "block": {
    "linearDamping": 0.4,
    "angularDamping": 0.5,
    "friction": 0.8,
    "density": 1.5
  }
}
```

## Troubleshooting

### Problem: Player Moves Too Fast

**Solution:**

- Decrease `minForce` and `maxForce`
- Increase `linearDamping`
- Increase `friction` for better control

### Problem: Player Doesn't Move Enough

**Solution:**

- Increase `minForce` and `maxForce`
- Decrease `linearDamping`
- Check that `maxForce >= minForce`

### Problem: Blocks Are Too Hard to Push

**Solution:**

- Decrease `density`
- Decrease `friction`
- Decrease `linearDamping`

### Problem: Blocks Slide Off Platform Too Easily

**Solution:**

- Increase `friction`
- Increase `density` (heavier blocks are more stable)
- Increase `angularDamping` (less rotation)

### Problem: Player Spins Too Much

**Solution:**

- Increase `angularDamping`
- Increase `friction` (less sliding = less spinning)

### Problem: Player Doesn't Stop When Expected

**Solution:**

- Increase `linearDamping`
- Increase `friction`
- Decrease `minForce` and `maxForce`

## Workflow Recommendations

### 1. **Use Version Control**

Always commit your physics configurations to version control. This allows you to:

- Track changes over time
- Revert to previous configurations
- Compare different configurations
- Share configurations with team members

### 2. **Create Test Scenarios**

Create specific test scenarios to validate physics changes:

- Can player reach all areas?
- Can blocks be pushed to goal?
- Does player fall off platform too easily?
- Is movement responsive enough?

### 3. **Document Your Changes**

When making changes, document why:

```json
{
  // Increased friction for better control on tight platforms
  "player": {
    "friction": 0.85
  }
}
```

### 4. **Use Example Files**

Copy example files from `public/data/examples/` as starting points:

- `physics-config-easy.json` - For easier gameplay
- `physics-config-hard.json` - For harder gameplay
- `physics-config-ice.json` - For slippery physics
- `physics-config-heavy.json` - For weighty physics
- `physics-config-responsive.json` - For responsive controls

### 5. **Validate Before Committing**

Always run the validator before committing:

```bash
npm run validate:dsl
```

This catches errors before they reach the game.

### 6. **Test in Different Scenarios**

Test physics changes in:

- Different scenes
- Different platform sizes
- Different block positions
- Edge cases (corners, edges, etc.)

### 7. **Get Feedback**

Have others test your physics changes. What feels good to you might not feel good to others.

## Property Interaction Guide

Understanding how properties interact helps you tune more effectively:

| Property         | Affects                | Interacts With              |
| ---------------- | ---------------------- | --------------------------- |
| `friction`       | Sliding, control       | `linearDamping`, `density`  |
| `minForce`       | Base movement power    | `maxForce`, `linearDamping` |
| `maxForce`       | Maximum movement power | `minForce`, `linearDamping` |
| `linearDamping`  | Speed decay            | `friction`, force values    |
| `angularDamping` | Rotation decay         | `friction`                  |
| `density`        | Weight, stability      | `friction`, `linearDamping` |

## Quick Reference

### Player Tuning Quick Reference

| Goal            | Friction | minForce | maxForce | linearDamping | angularDamping |
| --------------- | -------- | -------- | -------- | ------------- | -------------- |
| More responsive | ↑        | ↑        | ↑        | ↓             | -              |
| Less responsive | ↓        | ↓        | ↓        | ↑             | -              |
| More control    | ↑        | -        | -        | ↑             | ↑              |
| Slippery        | ↓        | -        | -        | ↓             | ↓              |

### Block Tuning Quick Reference

| Goal           | linearDamping | angularDamping | friction | density |
| -------------- | ------------- | -------------- | -------- | ------- |
| Easier to push | ↓             | ↓              | ↓        | ↓       |
| Harder to push | ↑             | ↑              | ↑        | ↑       |
| More stable    | -             | ↑              | ↑        | ↑       |
| Slides easily  | ↓             | ↓              | ↓        | -       |

## See Also

- [DSL Usage Guide](./dsl-usage.md) - How to edit configuration files
- [DSL Schema Documentation](./dsl-schema.md) - Complete schema reference
- Example configurations in `public/data/examples/`
