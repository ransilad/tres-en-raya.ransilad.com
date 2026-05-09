---
name: Lumina Games
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bbc9cd'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#859397'
  outline-variant: '#3c494c'
  surface-tint: '#2fd9f4'
  primary: '#8aebff'
  on-primary: '#00363e'
  primary-container: '#22d3ee'
  on-primary-container: '#005763'
  inverse-primary: '#006877'
  secondary: '#ffb2b9'
  on-secondary: '#67001f'
  secondary-container: '#891933'
  on-secondary-container: '#ff97a3'
  tertiary: '#d2ddf5'
  on-tertiary: '#263143'
  tertiary-container: '#b6c1d9'
  on-tertiary-container: '#444f63'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#a2eeff'
  primary-fixed-dim: '#2fd9f4'
  on-primary-fixed: '#001f25'
  on-primary-fixed-variant: '#004e5a'
  secondary-fixed: '#ffdadc'
  secondary-fixed-dim: '#ffb2b9'
  on-secondary-fixed: '#400010'
  on-secondary-fixed-variant: '#891933'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  stat-value:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-padding: 24px
  stack-gap-lg: 32px
  stack-gap-md: 16px
  stack-gap-sm: 8px
  grid-gap: 12px
---

## Brand & Style

This design system is built for a focused, immersive gaming experience on mobile devices. The brand personality is modern, clean, and energetic, stripping away the clutter typically associated with mobile gaming interfaces. By utilizing a "Dark Minimalist" aesthetic, the system emphasizes gameplay and statistics through high-contrast accents rather than complex decorative elements.

The style leverages a dark environment where vibrant cyan and coral interactive elements appear to glow against deep charcoal surfaces. This approach ensures maximum legibility and reduces eye strain during extended play sessions, while the rounded geometry maintains an approachable, friendly character.

## Colors

The palette is anchored by a sophisticated deep navy/charcoal base (`#0F172A`) to provide depth. 

- **Primary (Cyan):** Used for Player 1, successful actions, and primary "Start" or "Confirm" buttons. It provides a sharp, electric contrast against the dark background.
- **Secondary (Coral):** Used for Player 2, error states, and "Leave" or "Cancel" actions. It is soft yet distinct enough to remain visible in high-speed interactions.
- **Surface (Slate):** A lighter navy (`#1E293B`) is used for inactive game tiles and container backgrounds to create subtle layering without the need for borders.
- **Text:** Pure white is reserved for critical headers, while a muted grey-blue is used for secondary labels to maintain a clear visual hierarchy.

## Typography

The design system utilizes **Outfit** for its geometric clarity and friendly rounded terminals. 

Large, bold headlines are used for personalization ("HI VIKRAM"), while secondary headers use lighter weights to create a "sub-head" effect. A specialized `stat-value` style is defined for game scores and win/loss tallies to ensure they are the most prominent data points on the screen. Small labels use all-caps with increased letter spacing to serve as clear descriptors for numerical data without distracting from the values themselves.

## Layout & Spacing

The layout follows a strict vertical stack optimized for one-handed mobile use. 

- **Safe Zones:** A 24px horizontal margin is maintained throughout to prevent content from touching the screen edges.
- **Vertical Rhythm:** Elements are grouped into three distinct zones: Header (Greeting/Status), Stats (Numerical data), and Action (Game Grid/Primary Button).
- **Game Grid:** A flexible square grid utilizes a 12px gap between tiles. On mobile, this grid should expand to fill the container width while maintaining aspect ratio.
- **Centered Focus:** Major interactive buttons are centered at the bottom of the screen (above the OS gesture bar) for easy thumb access.

## Elevation & Depth

This system avoids heavy shadows and traditional skeuomorphism in favor of **Tonal Layering**.

1.  **Level 0 (Base):** The darkest navy (`#0F172A`) serves as the canvas.
2.  **Level 1 (Inert Elements):** Game tiles and background cards use a slightly lighter slate (`#1E293B`).
3.  **Level 2 (Active Elements):** High-saturation colors (Cyan/Coral) indicate the top layer of the hierarchy.

A soft, diffused ambient shadow (15% opacity black, 20px blur) is applied only to the primary action buttons to give them a subtle "lift" from the game board, ensuring they feel like the final step in the user flow.

## Shapes

The shape language is consistently rounded to match the typography. 

Standard UI containers and game tiles use a 0.5rem (8px) radius. Larger components, such as the primary "Start" or "Leave" buttons, use a pill-shaped (fully rounded) radius to differentiate them from the square game grid. This contrast in roundedness helps the user subconsciously distinguish between "gameplay" area and "navigation" area.

## Components

### Buttons
Primary buttons are pill-shaped, spanning roughly 60% of the screen width. They use a solid fill of either the Primary Cyan or Secondary Coral with dark navy text for maximum contrast. No borders are used.

### Game Tiles
Tiles are square with Level 1 elevation. When "active" (marked with an X or O), the icon takes the color of the player. The tile background remains dark to let the vibrant icon shine.

### Stat Blocks
Stats are arranged in a horizontal row. Each block consists of an uppercase label at the top and a large `stat-value` below. The color of the value reflects the category (e.g., Losses in Coral, Wins in Cyan).

### Progress & Status
Status indicators (like the Sun or Moon icons) should be simplified vector shapes placed in the top right, serving as a secondary visual anchor for the header section.

### Input Fields
If required, inputs should follow the Game Tile style: a Level 1 background with a subtle 1px border appearing only on focus, using the Primary Cyan color.