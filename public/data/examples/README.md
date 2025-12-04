# Physics Configuration Examples

This directory contains example physics configurations demonstrating different gameplay feels.

## Available Examples

### `physics-config-easy.json`

**Easy Mode** - Designed for easier gameplay

- **Player**: High friction (0.9) for better control, increased forces (1.5-4.0) for responsiveness
- **Block**: Light blocks (density 0.3) that are easy to push, moderate friction (0.6)
- **Use Case**: Beginner-friendly gameplay, easier puzzles

### `physics-config-hard.json`

**Hard Mode** - Designed for challenging gameplay

- **Player**: Lower friction (0.5) for less control, reduced forces (0.8-2.5) for slower movement
- **Block**: Heavy blocks (density 0.8) that are harder to push, low friction (0.2)
- **Use Case**: Challenging gameplay, difficult puzzles

### `physics-config-ice.json`

**Ice Physics** - Everything slides around like on ice

- **Player**: Very low friction (0.1), low damping (0.1-0.2) for momentum
- **Block**: Very low friction (0.05), light blocks (density 0.3) that slide easily
- **Use Case**: Unique gameplay mechanic, slippery surfaces

### `physics-config-heavy.json`

**Heavy Physics** - Everything feels weighty and substantial

- **Player**: High friction (0.85) for control, high forces (2.0-5.0) for power
- **Block**: Very heavy blocks (density 1.5), high friction (0.8) for stability
- **Use Case**: Realistic physics feel, weighty gameplay

### `physics-config-responsive.json`

**Responsive Controls** - Quick and responsive movement

- **Player**: High friction (0.8) for control, high forces (2.0-4.5) for responsiveness, low damping (0.15)
- **Block**: Light blocks (density 0.4), moderate friction (0.4)
- **Use Case**: Fast-paced gameplay, quick reactions needed

## Usage

To use an example configuration:

1. Copy the desired example file:

   ```bash
   cp public/data/examples/physics-config-easy.json public/data/physics-config.json
   ```

2. Or manually copy the contents into `public/data/physics-config.json`

3. Validate the configuration:

   ```bash
   npm run validate:dsl
   ```

4. Test in the game to see how it feels

## Customization

Feel free to modify these examples to create your own physics configurations. See [DSL Best Practices](../../../docs/dsl-best-practices.md) for guidance on tuning physics properties.

## See Also

- [DSL Usage Guide](../../../docs/dsl-usage.md) - How to edit configuration files
- [DSL Best Practices](../../../docs/dsl-best-practices.md) - Physics tuning guide
- [DSL Schema Documentation](../../../docs/dsl-schema.md) - Complete schema reference
