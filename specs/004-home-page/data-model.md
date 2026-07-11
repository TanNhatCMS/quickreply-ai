# Data Model: Home Page — Phong Vu Storefront Redesign

**Date**: 2026-07-12

## Entities

### Product

Static data entity for the home page product grid.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (e.g., `"lenovo-loq-15arp10e"`) |
| `name` | `string` | Display name (e.g., `"Laptop Lenovo LOQ Essential 15ARP10E"`) |
| `brand` | `string` | Brand name for filtering (e.g., `"Asus"`, `"Acer"`, `"Lenovo"`) |
| `price` | `number` | Current price in VND (e.g., `25990000`) |
| `originalPrice` | `number` | Original price before discount |
| `image` | `string` | Product image URL |
| `specs` | `ProductSpecs` | Hardware specifications |
| `category` | `string` | Category slug (e.g., `"laptop"`) |
| `discountBadge` | `string?` | Optional badge text (e.g., `"TIẾT KIỆM 10M"`) |

### ProductSpecs

Nested object for hardware specifications. Displayed in JetBrains Mono font.

| Field | Type | Description |
|-------|------|-------------|
| `cpu` | `string` | Processor (e.g., `"Ryzen 5 7535HS"`) |
| `gpu` | `string` | Graphics card (e.g., `"RTX™ 3050"`) |
| `ram` | `string` | Memory (e.g., `"16GB RAM"`) |
| `storage` | `string` | Storage (e.g., `"512GB SSD"`) |

### Category

Navigation item for the category bar.

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Display name (e.g., `"Laptop"`) |
| `slug` | `string` | URL-safe identifier (e.g., `"laptop"`) |
| `icon` | `string` | Material Symbols icon name (e.g., `"laptop_mac"`) |

## Relationships

- Product `category` → Category `slug` (many-to-one)
- Product `brand` → used for brand filtering (Asus, Acer, Lenovo)

## Validation Rules

- `price` must be less than `originalPrice` (discount is always positive)
- `brand` must be one of the supported filter brands
- `image` must be a valid URL
- `specs` fields are required (no optional specs)

## State Transitions

None — all data is static for MVP. No lifecycle states.
