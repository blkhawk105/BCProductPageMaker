# Custom Fields — Product Filters

This document is the single source of truth for BigCommerce custom field definitions used for faceted search and category filtering. It is read at runtime by `skills/product-custom-fields.md` on every task.

**To update this document:** Edit it directly. No skill repackaging required. Changes take effect on the next task run.

---

## General Guidelines

These rules apply to all categories and all fields. Always apply them after resolving field values.

- **Flat symbols**: Use lowercase `b` — never emoji, unicode ♭, or any other character. Applies to any field containing a key or pitch value (e.g., `Bb`, `Eb`, not `B♭`).
- **Bore sizes**: No leading zero before the decimal (`.445"` not `0.445"`).
- **Wattage**: Always lowercase `w` (e.g., `50w` not `50W`).
- **Numeric fields**: Use numerals, not words (e.g., `6` not `six`).
- **Bell sizes**: Round to nearest 1/8"; always include hyphen between whole number and fraction (e.g., `12-1/8"` not `12 1/8"`).

---

## Table of Contents

1. [General Guidelines](#general-guidelines)
1. [Band and Orchestra](#band-and-orchestra)
1. [Guitars and Ukuleles](#guitars-and-ukuleles)
1. [Drums and Percussion](#drums-and-percussion)
1. [Keyboards and Synthesizers](#keyboards-and-synthesizers)
1. [Pro Audio](#pro-audio)
1. [Accessories](#accessories)

<div style="page-break-after: always;"></div>

## Band and Orchestra

Some general details and guidelines specific to the category should go here

1. Band Instruments
   1. [Piccolos](#piccolos)
   1. [Flutes](#flutes)
   1. [Double Reeds](#double-reeds)
   1. [Clarinets](#clarinets)
   1. [Saxophones](#saxophones)
   1. [Trumpets and Cornets](#trumpets-and-cornets)
   1. [Flugelhorns](#flugelhorns)
   1. [French Horns](#french-horns)
   1. [Trombones](#trombones)
   1. [Baritones and Euphoniums](#baritones-and-euphoniums)
   1. [Tubas](#tubas)

1. Orchestra Instruments
   1. [Violin](#violin)
   1. [Viola](#viola)
   1. [Cello](#cello)
   1. [Double Bass](#double-bass)

[Back to Main Table of Contents](#table-of-contents)

<div style="page-break-after: always;"></div>

## Piccolos

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name     | Required&nbsp;Value                           | Example&nbsp;Values                                                                                         | Notes |
| ------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----- |
| Series                          | ---                                           | Yamaha 400, Jupiter 700, ect.                                                                               | ---   |
| Level                           | Student <br/> Intermediate <br/> Professional | ---                                                                                                         | ---   |
| Headjoint&nbsp;Material         | ---                                           | Solid Silver, <span style="white-space: nowrap">Silver-Plated</span>, Grenadilla, Nickel, Gold Plated, etc. | ---   |
| Body&nbsp;Material              | ---                                           | Solid Silver, <span style="white-space: nowrap">Silver-Plated</span>, Grenadilla, Nickel, Gold Plated, etc. | ---   |
| Has&nbsp;Split&nbsp;E&nbsp;Key  | Yes <br/> No                                  | ---                                                                                                         | ---   |
| Has&nbsp;C#&nbsp;Trill&nbsp;Key | Yes <br/> No                                  | ---                                                                                                         | ---   |
| Key&nbsp;Material               | ---                                           | Solid Silver, <span style="white-space: nowrap">Silver-Plated</span>, Nickel, Gold Plated, etc.             | ---   |

[Back to Band and Orchestra](#band-and-orchestra)

<div style="page-break-after: always;"></div>

## Flutes

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name     | Required&nbsp;Value                           | Example&nbsp;Values                                                                                         | Notes |
| ------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----- |
| Series                          | ---                                           | Yamaha 400, Jupiter 700, ect.                                                                               | ---   |
| Level                           | Student <br/> Intermediate <br/> Professional | ---                                                                                                         | ---   |
| Headjoint&nbsp;Material         | ---                                           | Solid Silver, <span style="white-space: nowrap">Silver-Plated</span>, Grenadilla, Nickel, Gold Plated, etc. | ---   |
| Body&nbsp;Material              | ---                                           | Solid Silver, <span style="white-space: nowrap">Silver-Plated</span>, Nickel, Grenadilla, Gold Plated, etc. | ---   |
| Key&nbsp;Type                   | Open Hole <br/> Closed Hole                   | ---                                                                                                         | ---   |
| Footjoint                       | B <br/> C                                     | ---                                                                                                         | ---   |
| G&nbsp;Key                      | Offset <br/> Inline                           | ---                                                                                                         | ---   |
| Has&nbsp;Split&nbsp;E&nbsp;Key  | Yes <br/> No                                  | ---                                                                                                         | ---   |
| Has&nbsp;C#&nbsp;Trill&nbsp;Key | Yes <br/> No                                  | ---                                                                                                         | ---   |
| Lip&nbsp;Plate&nbsp;Material    | ---                                           | Solid Silver, <span style="white-space: nowrap">Silver-Plated</span>, Nickel, Gold Plated, etc.             | ---   |
| Key&nbsp;Arms                   | Pointed <br/> Y-Arm                           | ---                                                                                                         | ---   |
| Key&nbsp;Material               | ---                                           | Solid Silver, <span style="white-space: nowrap">Silver-Plated</span>, Nickel, Gold Plated, etc.             | ---   |

[Back to Band and Orchestra](#band-and-orchestra)

<div style="page-break-after: always;"></div>

## Double Reeds

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                           | Example&nbsp;Values                              | Notes |
| --------------------------- | --------------------------------------------- | ------------------------------------------------ | ----- |
| Type                        | ---                                           | Oboe, English Horn, Bassoon                      | ---   |
| Level                       | Student <br/> Intermediate <br/> Professional | ---                                              | ---   |
| Key&nbsp;System             | ---                                           | Simplified Conservatory, Full Conservatoire, etc | ---   |
| Body&nbsp;Material          | ---                                           | Grenadilla, Ebony, ABS, etc.                     | ---   |

[Back to Band and Orchestra](#band-and-orchestra)

<div style="page-break-after: always;"></div>

## Clarinets

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                                              | Example&nbsp;Values                                                  | Notes |
| --------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------- | ----- |
| Level                       | Student <br/> Intermediate <br/> Professional                    | ---                                                                  | ---   |
| Type                        | Soprano <br/> Alto <br/> Bass <br/> Contra-Alto <br/> Contrabass | ---                                                                  | ---   |
| Instrument&nbsp;Key         | Bb <br/> Eb <br/> A                                              | ---                                                                  | ---   |
| Body&nbsp;Material          | ---                                                              | ABS, Grenadilla, ect.                                                | ---   |
| Key&nbsp;Material           | ---                                                              | Silver, <span style="white-space: nowrap">Silver-Plated</span>, ect. | ---   |
| Bell&nbsp;Material          | ---                                                              | ABS, Grenadilla, ect.                                                | ---   |
| Barrel&nbsp;Material        | ---                                                              | ABS, Grenadilla, ect.                                                | ---   |
| Thumb&nbsp;Rest             | Adjustable <br/> Fixed                                           | ---                                                                  | ---   |

[Back to Band and Orchestra](#band-and-orchestra)

<div style="page-break-after: always;"></div>

## Saxophones

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                                                            | Example&nbsp;Values                                                        | Notes                                                                        |
| --------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Type                        | Soprano Sax <br/> Alto Sax <br/> Tenor Sax <br/> Baritone Sax <br/> Electronic | ---                                                                        | ---                                                                          |
| Level                       | Student <br/> Intermediate <br/> Professional                                  | ---                                                                        | ---                                                                          |
| Finish                      | ---                                                                            | Gold Lacquer, <span style="white-space: nowrap">Silver-Plated</span>, ect. | ---                                                                          |
| Instrument&nbsp;Key         | ---                                                                            | Eb, Bb, etc.                                                               | Use a lowercase b as the flat symbol, do not use emoji or unicode characters |
| Body&nbsp;Material          | ---                                                                            | Yellow Brass, Rose Brass, etc                                              | ---                                                                          |

[Back to Band and Orchestra](#band-and-orchestra)

<div style="page-break-after: always;"></div>

## Trumpets and Cornets

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                           | Example&nbsp;Values                                                        | Notes                                                                        |
| --------------------------- | --------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Level                       | Student <br/> Intermediate <br/> Professional | ---                                                                        | ---                                                                          |
| Instrument&nbsp;Key         | ---                                           | Eb, Bb, etc.                                                               | Use a lowercase b as the flat symbol, do not use emoji or unicode characters |
| Bore                        | ---                                           | .445", .463", etc                                                          | Do not include a zero before the decimal.                                    |
| Bell&nbsp;Material          | ---                                           | Yellow Brass, Rose Brass, etc                                              | ---                                                                          |
| Finish                      | ---                                           | Gold Lacquer, <span style="white-space: nowrap">Silver-Plated</span>, ect. | ---                                                                          |
| Leadpipe                    | ---                                           | Reversed, standard, etc.                                                   | ---                                                                          |

[Back to Band and Orchestra](#band-and-orchestra)

<div style="page-break-after: always;"></div>

## Flugelhorns

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                           | Example&nbsp;Values                                                        | Notes                                                                        |
| --------------------------- | --------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Level                       | Student <br/> Intermediate <br/> Professional | ---                                                                        | ---                                                                          |
| Instrument&nbsp;Key         | ---                                           | Eb, Bb, etc.                                                               | Use a lowercase b as the flat symbol, do not use emoji or unicode characters |
| Bore                        | ---                                           | .445", .463", etc                                                          | Do not include a zero before the decimal.                                    |
| Bell&nbsp;Material          | ---                                           | Yellow Brass, Rose Brass, etc                                              | ---                                                                          |
| Finish                      | ---                                           | Gold Lacquer, <span style="white-space: nowrap">Silver-Plated</span>, ect. | ---                                                                          |

[Back to Band and Orchestra](#band-and-orchestra)

<div style="page-break-after: always;"></div>

## French Horns

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                           | Example&nbsp;Values            | Notes                                                                                          |
| --------------------------- | --------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------- |
| Level                       | Student <br/> Intermediate <br/> Professional | ---                            | ---                                                                                            |
| Type                        | Single <br/> Double <br/> Triple              | ---                            | ---                                                                                            |
| Wrap                        | Kruspe <br/> Geyer                            | ---                            | ---                                                                                            |
| Body&nbsp;Material          | ---                                           | Yellow Brass, Rose Brass, etc. | ---                                                                                            |
| Key                         | F <br/> Bb <br/> Eb <br/> F/Bb <br/> F/Bb/Eb  | ---                            | ---                                                                                            |
| Bell&nbsp;Type              | Fixed <br/> Detachable                        | ---                            | ---                                                                                            |
| Bell&nbsp;Size              | ---                                           | 10", 12-1/8"                   | Round to the nearest 1/8". Always include a hyphen between the whole number and it's fraction. |

[Back to Band and Orchestra](#band-and-orchestra)

<div style="page-break-after: always;"></div>

## Trombones

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                              | Example&nbsp;Values                                                        | Notes                                         |
| --------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------- | --------------------------------------------- |
| Level                       | Student <br/> Intermediate <br/> Professional    | ---                                                                        | ---                                           |
| Type                        | Alto <br/> Tenor <br/> Bass <br/> Valve Trombone | ---                                                                        | ---                                           |
| Wrap                        | Open <br/> Closed                                | ---                                                                        | ---                                           |
| Bell&nbsp;Material          | ---                                              | Yellow Brass, Rose Brass, etc                                              | ---                                           |
| Finish                      | ---                                              | Gold Lacquer, <span style="white-space: nowrap">Silver-Plated</span>, ect. | ---                                           |
| Bore                        | ---                                              | .545", .663", etc                                                          | Do not include a zero before the decimal.     |
| Receiver&nbsp;Size          | Large Shank <br/> Small Shank                    | ---                                                                        | Which size mouthpiece shank fits the leadpipe |
| Triggers                    | 0 <br/> 1 <br/> 2                                | ---                                                                        | ---                                           |

[Back to Band and Orchestra](#band-and-orchestra)

<div style="page-break-after: always;"></div>

## Baritones and Euphoniums

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                                                          | Example&nbsp;Values                                                        | Notes                                     |
| --------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------- |
| Series                      | ---                                                                          | Yamaha 400, Jupiter 700, ect.                                              | ---                                       |
| Level                       | Student <br/> Intermediate <br/> Professional                                | ---                                                                        | ---                                       |
| Number&nbsp;of&nbsp;Valves  | 3 <br/> 3+1 <br/> 4 <br/> 4+1 <br/> 5                                        | ---                                                                        | ---                                       |
| Valve&nbsp;Type             | Compensating <br/> <span style="white-space: nowrap">Non-Compensating</span> | ---                                                                        | ---                                       |
| Bore                        | ---                                                                          | .545", .663", etc                                                          | Do not include a zero before the decimal. |
| Finish                      | ---                                                                          | Gold Lacquer, <span style="white-space: nowrap">Silver-Plated</span>, ect. | ---                                       |

[Back to Band and Orchestra](#band-and-orchestra)

<div style="page-break-after: always;"></div>

## Tubas

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                           | Example&nbsp;Values                                                        | Notes                                     |
| --------------------------- | --------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------- |
| Type                        | Tuba <br/> Sousaphone                         | ---                                                                        | ---                                       |
| Level                       | Student <br/> Intermediate <br/> Professional | ---                                                                        | ---                                       |
| Number&nbsp;of&nbsp;Valves  | ---                                           | 3, 4, 5, etc.                                                              | ---                                       |
| Valve&nbsp;Type             | Piston <br/> Rotary                           | ---                                                                        | ---                                       |
| Instrument&nbsp;Key         | ---                                           | BBb, C, F, ect.                                                            | ---                                       |
| Size                        | ---                                           | 1/2, 3/4, 4/4                                                              | ---                                       |
| Bore                        | ---                                           | .645", .763", etc                                                          | Do not include a zero before the decimal. |
| Finish                      | ---                                           | Gold Lacquer, <span style="white-space: nowrap">Silver-Plated</span>, ect. | ---                                       |

[Back to Band and Orchestra](#band-and-orchestra)

<div style="page-break-after: always;"></div>

## Violin

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name        | Required&nbsp;Value                           | Example&nbsp;Values              | Notes |
| ---------------------------------- | --------------------------------------------- | -------------------------------- | ----- |
| Level                              | Student <br/> Intermediate <br/> Professional | ---                              | ---   |
| Size                               | ---                                           | 1/2, 3/4, 4/4, etc.              | ---   |
| Electric                           | Yes <br/> No                                  | ---                              | ---   |
| Top&nbsp;Wood                      | ---                                           | Mahogany, Spruce, Rosewood, etc  | ---   |
| Back&nbsp;and&nbsp;Sides&nbsp;Wood | ---                                           | Mahogany, Spruce, Rosewood, etc  | ---   |
| Fine&nbsp;Tuners                   | ---                                           | All Strings, E-String, None, etc | ---   |

[Back to Band and Orchestra](#band-and-orchestra)

<div style="page-break-after: always;"></div>

## Viola

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name        | Required&nbsp;Value                           | Example&nbsp;Values              | Notes |
| ---------------------------------- | --------------------------------------------- | -------------------------------- | ----- |
| Level                              | Student <br/> Intermediate <br/> Professional | ---                              | ---   |
| Size                               | ---                                           | 1/2, 3/4, 4/4, etc.              | ---   |
| Electric                           | Yes <br/> No                                  | ---                              | ---   |
| Top&nbsp;Wood                      | ---                                           | Mahogany, Spruce, Rosewood, etc  | ---   |
| Back&nbsp;and&nbsp;Sides&nbsp;Wood | ---                                           | Mahogany, Spruce, Rosewood, etc  | ---   |
| Fine&nbsp;Tuners                   | ---                                           | All Strings, E-String, None, etc | ---   |

[Back to Band and Orchestra](#band-and-orchestra)

<div style="page-break-after: always;"></div>

## Cello

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name        | Required&nbsp;Value                           | Example&nbsp;Values              | Notes |
| ---------------------------------- | --------------------------------------------- | -------------------------------- | ----- |
| Level                              | Student <br/> Intermediate <br/> Professional | ---                              | ---   |
| Size                               | ---                                           | 1/2, 3/4, 4/4, etc.              | ---   |
| Electric                           | Yes <br/> No                                  | ---                              | ---   |
| Top&nbsp;Wood                      | ---                                           | Mahogany, Spruce, Rosewood, etc  | ---   |
| Back&nbsp;and&nbsp;Sides&nbsp;Wood | ---                                           | Mahogany, Spruce, Rosewood, etc  | ---   |
| Fine&nbsp;Tuners                   | ---                                           | All Strings, E-String, None, etc | ---   |

[Back to Band and Orchestra](#band-and-orchestra)

<div style="page-break-after: always;"></div>

## Double Bass

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name        | Required&nbsp;Value                           | Example&nbsp;Values              | Notes |
| ---------------------------------- | --------------------------------------------- | -------------------------------- | ----- |
| Level                              | Student <br/> Intermediate <br/> Professional | ---                              | ---   |
| Size                               | ---                                           | 1/2, 3/4, 4/4, etc.              | ---   |
| Electric                           | Yes <br/> No                                  | ---                              | ---   |
| Top&nbsp;Wood                      | ---                                           | Mahogany, Spruce, Rosewood, etc  | ---   |
| Back&nbsp;and&nbsp;Sides&nbsp;Wood | ---                                           | Mahogany, Spruce, Rosewood, etc  | ---   |
| Fine&nbsp;Tuners                   | ---                                           | All Strings, E-String, None, etc | ---   |

<div style="page-break-after: always;"></div>

## Guitars and Ukuleles

Some general details and guidelines specific to the category should go here

1. Guitars and Ukuleles
   1. [Acoustic Guitars](#acoustic-guitars)
   1. [Electric Guitars](#electric-guitars)
   1. [Bass Guitars](#bass-guitars)
   1. [Ukuleles](#ukuleles)

1. Guitar and Bass Amps
   1. [Acoustic Guitar Amps](#acoustic-guitar-amps)
   1. [Electric Guitar Amps](#electric-guitar-amps)
   1. [Bass Guitar Amps](#bass-guitar-amps)

1. Effects
   1. [Single Effect Pedals](#single-effect-pedals)
   1. [Multi-Effects](#multi-effects)

[Back to Main Table of Contents](#table-of-contents)

<div style="page-break-after: always;"></div>

## Acoustic Guitars

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name         | Required&nbsp;Value                                                                                                                   | Example&nbsp;Values                                         | Notes                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| Filter&nbsp;Color                   | Black <br/> Blue <br/> Brown <br/> Gray <br/> Green <br/> Orange <br/> Pink <br/> Purple <br/> Red <br/> Tan <br/> White <br/> Yellow | ---                                                         | ---                                                 |
| Manufacturer&nbsp;Color             | ---                                                                                                                                   | ---                                                         | Color as provided by the manufacturer               |
| Series&nbsp;Name                    | ---                                                                                                                                   | Acoustasonic, Fender California, Yamaha TransAcoustic, etc. | Delete this if product does not belong to a series. |
| Number&nbsp;of&nbsp;Strings         | ---                                                                                                                                   | 4, 6, 8, 12, etc.                                           | Should be numeric characters, not words             |
| Body&nbsp;Shape                     | ---                                                                                                                                   | Grand Symphony, Parlor, Thinline, ect.                      | ---                                                 |
| String&nbsp;Type                    | Steel <br/> Nylon                                                                                                                     | ---                                                         | ---                                                 |
| Electronics                         | Yes <br/> No                                                                                                                          | ---                                                         | ---                                                 |
| Top&nbsp;Wood                       | ---                                                                                                                                   | Mahogany, Spruce, Rosewood, etc                             | ---                                                 |
| Back&nbsp;and&nbsp;Sides&nbsp;Wood  | ---                                                                                                                                   | Mahogany, Spruce, Rosewood, etc                             | ---                                                 |
| Left&nbsp;or&nbsp;Right&nbsp;Handed | Left <br/> Right                                                                                                                      | ---                                                         | ---                                                 |

[Back to Guitars and Ukuleles](#guitars-and-ukuleles)

<div style="page-break-after: always;"></div>

## Electric Guitars

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name         | Required&nbsp;Value                                                                                                                   | Example&nbsp;Values                                         | Notes                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| Filter&nbsp;Color                   | Black <br/> Blue <br/> Brown <br/> Gray <br/> Green <br/> Orange <br/> Pink <br/> Purple <br/> Red <br/> Tan <br/> White <br/> Yellow | ---                                                         | ---                                                 |
| Manufacturer&nbsp;Color             | ---                                                                                                                                   | ---                                                         | Color as provided by the manufacturer               |
| Series&nbsp;Name                    | ---                                                                                                                                   | Acoustasonic, Fender California, Yamaha TransAcoustic, etc. | Delete this if product does not belong to a series. |
| Number&nbsp;of&nbsp;Strings         | ---                                                                                                                                   | 4, 6, 8, 12, etc.                                           | Should be numeric characters, not words             |
| Body&nbsp;Style                     | Solid Body <br/> Semi-Hollow <br/> Hollow Body                                                                                        | ---                                                         | ---                                                 |
| Fretboard&nbsp;Material             | ---                                                                                                                                   | Rosewood, Ebony, Maple, ect.                                | ---                                                 |
| Neck&nbsp;Joint                     | Bolt-On <br/> Set-In <br/> Neck-Through <br/> Set-Through                                                                             | ---                                                         | ---                                                 |
| Pickup&nbsp;Configuration           | H <br/> HH <br/> HHH <br/> HHS <br/> HS <br/> HSH <br/> HSS <br/> S <br/> SH <br/> SS <br/> SSH <br/> SSS                             | ---                                                         | ---                                                 |
| Bridge/Tailpiece                    | Fixed <br/> Tremolo <br/> Locking                                                                                                     | ---                                                         | ---                                                 |
| Left&nbsp;or&nbsp;Right&nbsp;Handed | Left <br/> Right                                                                                                                      | ---                                                         | ---                                                 |

[Back to Guitars and Ukuleles](#guitars-and-ukuleles)

<div style="page-break-after: always;"></div>

## Bass Guitars

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name         | Required&nbsp;Value                                                                                                                   | Example&nbsp;Values                                         | Notes                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------- |
| Filter&nbsp;Color                   | Black <br/> Blue <br/> Brown <br/> Gray <br/> Green <br/> Orange <br/> Pink <br/> Purple <br/> Red <br/> Tan <br/> White <br/> Yellow | ---                                                         | ---                                                       |
| Manufacturer&nbsp;Color             | ---                                                                                                                                   | ---                                                         | Color as provided by the manufacturer                     |
| Series&nbsp;Name                    | ---                                                                                                                                   | Acoustasonic, Fender California, Yamaha TransAcoustic, etc. | Delete this if product does not belong to a series.       |
| Number&nbsp;of&nbsp;Strings         | ---                                                                                                                                   | 4, 6, 8, 12, etc.                                           | Should be numeric characters, not words                   |
| Fretboard&nbsp;Material             | ---                                                                                                                                   | Rosewood, Ebony, Maple, ect.                                | ---                                                       |
| Pickup&nbsp;Style                   | Active <br/> Passive <br/> Active/Passive                                                                                             | ---                                                         | ---                                                       |
| Number&nbsp;of&nbsp;Frets           | ---                                                                                                                                   | Fretless, 21, 22, 24 etc.                                   | Should be numeric characters, not words (unless Fretless) |
| Number&nbsp;of&nbsp;Pickups         | 0 <br/> 1 <br/> 2 <br/> 3                                                                                                             | ---                                                         | ---                                                       |
| Pickup&nbsp;Configuration           | Acoustic <br/> H <br/> HH <br/> HHH <br/> HHS <br/> HS <br/> HSH <br/> HSS <br/> S <br/> SH <br/> SS <br/> SSH <br/> SSS              | ---                                                         | ---                                                       |
| Left&nbsp;or&nbsp;Right&nbsp;Handed | Left <br/> Right                                                                                                                      | ---                                                         | ---                                                       |

[Back to Guitars and Ukuleles](#guitars-and-ukuleles)

<div style="page-break-after: always;"></div>

## Ukuleles

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name        | Required&nbsp;Value                                                                                                                   | Example&nbsp;Values                                         | Notes                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| Filter&nbsp;Color                  | Black <br/> Blue <br/> Brown <br/> Gray <br/> Green <br/> Orange <br/> Pink <br/> Purple <br/> Red <br/> Tan <br/> White <br/> Yellow | ---                                                         | ---                                                 |
| Manufacturer&nbsp;Color            | ---                                                                                                                                   | ---                                                         | Color as provided by the manufacturer               |
| Series&nbsp;Name                   | ---                                                                                                                                   | Acoustasonic, Fender California, Yamaha TransAcoustic, etc. | Delete this if product does not belong to a series. |
| Size                               | Soprano <br/> Concert <br/> Tenor <br/> Baritone                                                                                      | ---                                                         | ---                                                 |
| Electronics                        | Yes <br/> No                                                                                                                          | ---                                                         | ---                                                 |
| Top&nbsp;Wood                      | ---                                                                                                                                   | Mahogany, Spruce, Rosewood, etc                             | ---                                                 |
| Back&nbsp;and&nbsp;Sides&nbsp;Wood | ---                                                                                                                                   | Mahogany, Spruce, Rosewood, etc                             | ---                                                 |
| Number&nbsp;of&nbsp;Strings        | ---                                                                                                                                   | 4, 6, 8, 12, etc.                                           | Should be numeric characters, not words             |
| Hybrid&nbsp;Uke                    | Bass <br/> Guitar <br/> Banjo <br/> Resonator                                                                                         | ---                                                         | Delete this out if it makes sense to do so.         |

[Back to Guitars and Ukuleles](#guitars-and-ukuleles)

<div style="page-break-after: always;"></div>

## Acoustic Guitar Amps

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name  | Required&nbsp;Value                                                                                                              | Example&nbsp;Values   | Notes                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------- |
| Number&nbsp;of&nbsp;Channels | ---                                                                                                                              | 1, 2, 3, etc          | Should be numeric characters, not words                               |
| Microphone&nbsp;Input        | Yes <br/> No                                                                                                                     | ---                   | ---                                                                   |
| Phantom&nbsp;Power           | Yes <br/> No                                                                                                                     | ---                   | ---                                                                   |
| Amp&nbsp;Wattage             | ---                                                                                                                              | 15w, 25w, 50w, etc.   | W should always be lowercase                                          |
| Direct&nbsp;Out              | None <br/> XLR <br/> 1/4"                                                                                                        | ---                   | ---                                                                   |
| Has&nbsp;Effects             | Yes <br/> No                                                                                                                     | ---                   | ---                                                                   |
| Feedback&nbsp;Control        | Yes <br/> No                                                                                                                     | ---                   | ---                                                                   |
| Speaker&nbsp;Size            | ---                                                                                                                              | 1 x 8", 2 x 10", etc. | Should be the main speaker, do not include tweeter size if applicable |
| Weight&nbsp;Range            | Less&nbsp;than&nbsp;10&nbsp;lbs. <br/> 11 – 20 lbs. <br/> 21 – 30 lbs. <br/> 31 – 40 lbs. <br/> More&nbsp;than&nbsp;40&nbsp;lbs. | ---                   | ---                                                                   |

[Back to Guitars and Ukuleles](#guitars-and-ukuleles)

<div style="page-break-after: always;"></div>

## Electric Guitar Amps

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name  | Required&nbsp;Value                                                                                                              | Example&nbsp;Values   | Notes                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------- |
| Style                        | Combo <br/> Head <br/> Cabinet                                                                                                   | ---                   | ---                                                                   |
| Type                         | Solid State <br/> Hybrid <br/> Tube                                                                                              | ---                   | ---                                                                   |
| Number&nbsp;of&nbsp;Channels | ---                                                                                                                              | 1, 2, 3, etc          | Should be numeric characters, not words                               |
| Has&nbsp;Effects             | Yes <br/> No                                                                                                                     | ---                   | ---                                                                   |
| Effects&nbsp;Loop            | Yes <br/> No                                                                                                                     | ---                   | ---                                                                   |
| Amp&nbsp;Wattage             | ---                                                                                                                              | 15w, 25w, 50w, etc.   | W should always be lowercase                                          |
| Speaker&nbsp;Size            | ---                                                                                                                              | 1 x 8", 2 x 10", etc. | Should be the main speaker, do not include tweeter size if applicable |
| Weight&nbsp;Range            | Less&nbsp;than&nbsp;10&nbsp;lbs. <br/> 11 – 20 lbs. <br/> 21 – 30 lbs. <br/> 31 – 40 lbs. <br/> More&nbsp;than&nbsp;40&nbsp;lbs. | ---                   | ---                                                                   |

[Back to Guitars and Ukuleles](#guitars-and-ukuleles)

<div style="page-break-after: always;"></div>

## Bass Guitar Amps

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                                                                                                              | Example&nbsp;Values   | Notes                                                                 |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------- |
| Style                       | Combo <br/> Head <br/> Cabinet                                                                                                   | ---                   | ---                                                                   |
| Type                        | Solid State <br/> Hybrid <br/> Tube                                                                                              | ---                   | ---                                                                   |
| Amp&nbsp;Wattage            | ---                                                                                                                              | 15w, 25w, 50w, etc.   | W should always be lowercase                                          |
| Direct&nbsp;Out             | None <br/> XLR <br/> 1/4"                                                                                                        | ---                   | ---                                                                   |
| Effects&nbsp;Loop           | Yes <br/> No                                                                                                                     | ---                   | ---                                                                   |
| Speaker&nbsp;Size           | ---                                                                                                                              | 1 x 8", 2 x 10", etc. | Should be the main speaker, do not include tweeter size if applicable |
| Weight&nbsp;Range           | Less&nbsp;than&nbsp;10&nbsp;lbs. <br/> 11 – 20 lbs. <br/> 21 – 30 lbs. <br/> 31 – 40 lbs. <br/> More&nbsp;than&nbsp;40&nbsp;lbs. | ---                   | ---                                                                   |

[Back to Guitars and Ukuleles](#guitars-and-ukuleles)

<div style="page-break-after: always;"></div>

## Single Effect Pedals

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                               | Example&nbsp;Values | Notes                                     |
| --------------------------- | ------------------------------------------------- | ------------------- | ----------------------------------------- |
| Analog/Digital              | Analog <br/> Digital <br/> Hybrid                 | ---                 | ---                                       |
| True&nbsp;Bypass            | Yes                                               | ---                 | If No, do not include this custom field.  |
| Inputs                      | ---                                               | 2 x 1/4", 1 x XLR   | ---                                       |
| Outputs                     | ---                                               | 2 x 1/4", 1 x XLR   | ---                                       |
| MIDI&nbsp;I/O               | In <br/> Out <br/> Thru <br/> USB <br/> Bluetooth | ---                 | ---                                       |
| Loop&nbsp;Time              | ---                                               | ---                 | If N/A, do not include this custom field. |
| Effects&nbsp;Loop           | Yes                                               | ---                 | If No, do not include this custom field.  |

[Back to Guitars and Ukuleles](#guitars-and-ukuleles)

<div style="page-break-after: always;"></div>

## Multi-Effects

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                               | Example&nbsp;Values | Notes                                    |
| --------------------------- | ------------------------------------------------- | ------------------- | ---------------------------------------- |
| Analog/Digital              | Analog <br/> Digital <br/> Hybrid                 | ---                 | ---                                      |
| True&nbsp;Bypass            | Yes                                               | ---                 | If No, do not include this custom field. |
| Inputs                      | ---                                               | 2 x 1/4", 1 x XLR   | ---                                      |
| Outputs                     | ---                                               | 2 x 1/4", 1 x XLR   | ---                                      |
| MIDI&nbsp;I/O               | In <br/> Out <br/> Thru <br/> USB <br/> Bluetooth | ---                 | ---                                      |
| Effects&nbsp;Loop           | Yes                                               | ---                 | If No, do not include this custom field. |

<div style="page-break-after: always;"></div>

## Drums and Percussion

Some general details and guidelines specific to the category should go here

1. [Acoustic Drums](#acoustic-drums)
1. [Electric Drums](#electric-drums)
1. [Snare Drums](#snare-drums)
1. [Cymbals](#cymbals)

[Back to Main Table of Contents](#table-of-contents)

<div style="page-break-after: always;"></div>

## Acoustic Drums

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                                                                                                                   | Example&nbsp;Values | Notes                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------- |
| Filter&nbsp;Color           | Black <br/> Blue <br/> Brown <br/> Gray <br/> Green <br/> Orange <br/> Pink <br/> Purple <br/> Red <br/> Tan <br/> White <br/> Yellow | ---                 | ---                                               |
| Configuration               | Shell Pack <br/> Complete Drum Set <br/> Hybrid <br/> Jr. Drum Set                                                                    | ---                 | Could also include things like cocktail and bebop |
| Includes&nbsp;Hardware      | Yes <br/> No                                                                                                                          | ---                 | ---                                               |
| Includes&nbsp;Cymbals       | Yes <br/> No                                                                                                                          | ---                 | ---                                               |
| Number&nbsp;of&nbsp;Drums   | ---                                                                                                                                   | 4, 6, 8, etc.       | Should be numeric characters, not words           |
| Shell&nbsp;Material         | ---                                                                                                                                   | Birch, Maple        | ---                                               |
| Bass&nbsp;Drum&nbsp;Size    | ---                                                                                                                                   | 18", 22", etc.      | ---                                               |
| Snare&nbsp;Drum&nbsp;Size   | ---                                                                                                                                   | 12", 13", 14" etc.  | ---                                               |

[Back to Drums and Percussion](#drums-and-percussion)

<div style="page-break-after: always;"></div>

## Electric Drums

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name        | Required&nbsp;Value                                                              | Example&nbsp;Values             | Notes                                               |
| ---------------------------------- | -------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------- |
| Series&nbsp;Name                   | ---                                                                              | Roland V-Drums, Yamaha DTX etc. | Delete this if product does not belong to a series. |
| Number&nbsp;of&nbsp;Drum&nbsp;Pads | ---                                                                              | 4, 6, 8, etc.                   | Should be numeric characters, not words             |
| Type                               | Drum Kit <br/> Module <br/> Pad/Controller <br/> Drum Trigger <br/> Drum Machine | ---                             | ---                                                 |
| Shell&nbsp;Style                   | Full Electric <br/> Hybrid                                                       | ---                             | ---                                                 |
| Bass&nbsp;Drum&nbsp;Trigger        | Tower&nbsp;Trigger&nbsp;Pad <br/> Kick&nbsp;Controller&nbsp;Pedal                | ---                             | ---                                                 |
| Number&nbsp;of&nbsp;Drum&nbsp;Kits | Less than 25 <br/> 25 - 50 <br/> 50 - 100 <br/> More than 100                    | ---                             | ---                                                 |
| MIDI&nbsp;I/O                      | In <br/> Out <br/> Thru <br/> USB <br/> Bluetooth                                | ---                             | ---                                                 |

[Back to Drums and Percussion](#drums-and-percussion)

<div style="page-break-after: always;"></div>

## Snare Drums

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                                                                                                                   | Example&nbsp;Values       | Notes |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ----- |
| Filter&nbsp;Color           | Black <br/> Blue <br/> Brown <br/> Gray <br/> Green <br/> Orange <br/> Pink <br/> Purple <br/> Red <br/> Tan <br/> White <br/> Yellow | ---                       | ---   |
| Shell&nbsp;Material         | ---                                                                                                                                   | Birch, Maple, Brass, etc. | ---   |
| Drum&nbsp;Diameter          | ---                                                                                                                                   | 12", 13", 14" etc.        | ---   |
| Drum&nbsp;Depth             | ---                                                                                                                                   | 4", 6", etc.              | ---   |
| Number&nbsp;of&nbsp;Lugs    | ---                                                                                                                                   | 8, 12, 14, etc.           | ---   |

[Back to Drums and Percussion](#drums-and-percussion)

<div style="page-break-after: always;"></div>

## Cymbals

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                                                                                   | Example&nbsp;Values             | Notes                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------- |
| Series&nbsp;Name            | ---                                                                                                   | Roland V-Drums, Yamaha DTX etc. | Delete this if product does not belong to a series. |
| Type                        | Crash <br/> Ride <br/> Splash <br/> Hi Hat <br/> Effects <br/> Pack                                   | ---                             | ---                                                 |
| Size                        | ---                                                                                                   | 8", 12", 22", etc.              | ---                                                 |
| Weight                      | Extra Thin <br/> Thin <br/> Medium Thin <br/> Medium <br/> Medium Heavy <br/> Heavy <br/> Extra Heavy | ---                             | ---                                                 |
| Finish                      | Traditional <br/> Brilliant <br/> Raw <br/> Natural <br/> Dark <br/> Hybrid <br/> Patina <br/> Matte  | ---                             | ---                                                 |
| Bell&nbsp;Size              | Small <br/> Medium <br/> Large <br/> Flat                                                             | ---                             | ---                                                 |

<div style="page-break-after: always;"></div>

## Keyboards and Synthesizers

Some general details and guidelines specific to the category should go here

1. [Digital Pianos](#digital-pianos)
1. [Portable Keyboards](#portable-keyboards)

[Back to Main Table of Contents](#table-of-contents)

<div style="page-break-after: always;"></div>

## Digital Pianos

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                                                                  | Example&nbsp;Values | Notes                                               |
| --------------------------- | ------------------------------------------------------------------------------------ | ------------------- | --------------------------------------------------- |
| Series&nbsp;Name            | ---                                                                                  | Casio Privia        | Delete this if product does not belong to a series. |
| Number&nbsp;of&nbsp;Keys    | ---                                                                                  | 4, 6, 8, etc.       | Should be numeric characters, not words             |
| Polyphony                   | ---                                                                                  | 12, 56, 128, etc.   | Number of sound that can be played at the same time |
| Key&nbsp;Type               | Non-weighted <br/> Semi-weighted <br/> Weighted                                      | ---                 | ---                                                 |
| Presets                     | Less than 50 <br/> 51 to 100 <br/> 101 to 500 <br/> 501 to 1000 <br/> More than 1000 | ---                 | ---                                                 |
| Built-in&nbsp;Speakers      | Yes                                                                                  | ---                 | If no, do not include this option                   |
| MIDI&nbsp;I/O               | In <br/> Out <br/> Thru <br/> USB <br/> Bluetooth                                    | ---                 | ---                                                 |

[Back to Keyboards and Synthesizers](#keyboards-and-synthesizers)

<div style="page-break-after: always;"></div>

## Portable Keyboards

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                                                                  | Example&nbsp;Values | Notes                                                     |
| --------------------------- | ------------------------------------------------------------------------------------ | ------------------- | --------------------------------------------------------- |
| Series&nbsp;Name            | ---                                                                                  | Casio Privia        | Delete this if product does not belong to a series.       |
| Number&nbsp;of&nbsp;Keys    | ---                                                                                  | 4, 6, 8, etc.       | Should be numeric characters, not words                   |
| Built-in&nbsp;Speakers      | Yes                                                                                  | ---                 | If no, do not include this option                         |
| Presets                     | Less than 50 <br/> 51 to 100 <br/> 101 to 500 <br/> 501 to 1000 <br/> More than 1000 | ---                 | ---                                                       |
| MIDI&nbsp;I/O               | In <br/> Out <br/> Thru <br/> USB <br/> Bluetooth                                    | ---                 | ---                                                       |
| Sequencer                   | ---                                                                                  | 6-tracks, 18-tracks | If the keyboard does not have a sequencer, leave this out |

<div style="page-break-after: always;"></div>

## Pro Audio

Some general details and guidelines specific to the category should go here

1. [Microphones](#microphones)
1. [Speakers](#speakers)
1. [Headphones](#headphones)

[Back to Main Table of Contents](#table-of-contents)

<div style="page-break-after: always;"></div>

## Microphones

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                                                                                                                           | Example&nbsp;Values                               | Notes                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------- |
| Series&nbsp;Name            | ---                                                                                                                                           | Shure Beta Series, Audio-Technica 40 Series, etc. | Delete this if product does not belong to a series.                   |
| Polar&nbsp;Pattern          | ---                                                                                                                                           | Cardioid, Omnidirectional, etc.                   | ---                                                                   |
| Diaphragm&nbsp;Size         | Large <br/> Medium <br/> Small                                                                                                                | ---                                               | ---                                                                   |
| Mono/Stereo                 | Mono <br/> Stereo Pair <br/> Stereo                                                                                                           | ---                                               | Stereo pair is for mics like the AT4041SP, a pack of two AT4041 mics. |
| Max&nbsp;Peak&nbsp;SPL      | Under&nbsp;120dB <br/> 120dB&nbsp;to&nbsp;130dB <br/> 131dB&nbsp;to&nbsp;140dB <br/> 141dB&nbsp;to&nbsp;150dB <br/> More&nbsp;than&nbsp;150dB | ---                                               | ---                                                                   |
| Connector                   | ---                                                                                                                                           | XLR, 1/4", Shure 6-pin, etc.                      | ---                                                                   |
| Best&nbsp;For               | Stage <br/> Studio <br/> Livestreaming <br/> Podcasting                                                                                       | ---                                               | ---                                                                   |

[Back to Pro Audio](#pro-audio)

<div style="page-break-after: always;"></div>

## Speakers

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                                                                                                                                                             | Example&nbsp;Values                     | Notes                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| Series&nbsp;Name            | ---                                                                                                                                                                             | Yamaha DBR Series, JBL SRX Series, etc. | Delete this if product does not belong to a series.                   |
| Powered                     | Yes <br/> No                                                                                                                                                                    | ---                                     | ---                                                                   |
| Speaker&nbsp;Size           | ---                                                                                                                                                                             | 8", 10", 12", etc.                      | Should be the main speaker, do not include tweeter size if applicable |
| Total&nbsp;Power            | Less&nbsp;than&nbsp;100W <br/> 101W&nbsp;to&nbsp;250W <br/> 251W&nbsp;to&nbsp;500W <br/> 501W&nbsp;to&nbsp;1000W <br/> 1001W&nbsp;to&nbsp;2000W <br/> More&nbsp;than&nbsp;2000W | ---                                     | ---                                                                   |
| Max&nbsp;Peak&nbsp;SPL      | Under&nbsp;120dB <br/> 120dB&nbsp;to&nbsp;130dB <br/> 131dB&nbsp;to&nbsp;140dB <br/> More&nbsp;than&nbsp;140dB                                                                  | ---                                     | ---                                                                   |
| Weight                      | Less&nbsp;than&nbsp;10&nbsp;lbs. <br/> 11&nbsp;–&nbsp;20&nbsp;lbs. <br/> 21&nbsp;–&nbsp;30&nbsp;lbs. <br/> 31&nbsp;–&nbsp;40&nbsp;lbs. <br/> More&nbsp;than&nbsp;40&nbsp;lbs.   | ---                                     | ---                                                                   |
| Height                      | Under 12" <br/> 12" to 24" <br/> 25" to 36" <br/> 37" to 48" <br/> More than 48"                                                                                                | ---                                     | ---                                                                   |
| Width                       | Under 12" <br/> 12" to 18" <br/> 19" to 24" <br/> More than 24"                                                                                                                 | ---                                     | ---                                                                   |
| Depth                       | Under 6" <br/> 6" to 12" <br/> 13" to 18" <br/> More than 18"                                                                                                                   | ---                                     | ---                                                                   |

[Back to Pro Audio](#pro-audio)

<div style="page-break-after: always;"></div>

## Headphones

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value                                                                                                                              | Example&nbsp;Values | Notes                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Filter&nbsp;Color           | Black <br/> Blue <br/> Brown <br/> Gray <br/> Green <br/> Orange <br/> Pink <br/> Purple <br/> Red <br/> Tan <br/> White <br/> Yellow <br> Clear | ---                 | ---                                                                                                                    |
| Type                        | Wired <br/> Wireless                                                                                                                             | ---                 | ---                                                                                                                    |
| Connectivity                | 1/4 " Plug <br/> 1/8 " Plug <br/> Bluetooth <br/> USB                                                                                            | ---                 | ---                                                                                                                    |
| Form Factor                 | Open <br/> Closed <br/> Semi-Open                                                                                                                | ---                 | For headphones only, do not include for earbuds.                                                                       |
| Fit                         | In Ear <br/> On Ear <br/> Over Ear                                                                                                               | ---                 | ---                                                                                                                    |
| Isolation&nbsp;Type         | Active&nbsp;Noise&nbsp;Cancelling <br/> Passive&nbsp;Noise&nbsp;Isolating                                                                        | ---                 | Do not include if they are non-isolating headphones.                                                                   |
| Number of Drivers           | ---                                                                                                                                              | 1, 2, 3, etc.       | Only use if working on earbuds unless the headphones have more than one driver. If Earbuds only have 1 driver, list 1. |
| Best&nbsp;For               | Studio <br/> Stage <br/> Audiophile <br/> Gaming <br/> Podcasting <br/> Streaming <br/> Drumming <br/> Video Creation                            | ---                 | ---                                                                                                                    |

<div style="page-break-after: always;"></div>

## Accessories

Some general details and guidelines specific to the category should go here

1. Strings
   1. [Guitar, Bass and Ukulele Strings](#guitar-bass-and-ukulele-strings)
   1. [Orchestral Strings](#orchestral-strings)

[Back to Main Table of Contents](#table-of-contents)

<div style="page-break-after: always;"></div>

## Guitar, Bass and Ukulele Strings

Custom field keys with descriptions and examples

**_All currently listed strings need to have their string gauges updated to this new option_**

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value | Example&nbsp;Values                        | Notes                                    |
| --------------------------- | ------------------- | ------------------------------------------ | ---------------------------------------- |
| Number&nbsp;of&nbsp;Strings | ---                 | 4, 6, 8, 12, etc.                          | Should be numeric characters, not words  |
| Instrument&nbsp;Type        | ---                 | Acoustic Guitar, Bass Guitar, Ukulele, etc | ---                                      |
| Winding&nbsp;Material       | ---                 | Stainless Steel, Phosphor Bronze, etc.     | ---                                      |
| Core&nbsp;Material          | ---                 | Hexagonal Steel, Round Titanium, etc       | ---                                      |
| Scale&nbsp;Length           | ---                 | Medium, Long, etc                          | ---                                      |
| Winding&nbsp;Type           | ---                 | Roundwound, Flatwound                      | ---                                      |
| High&nbsp;String&nbsp;Gauge | ---                 | .009, .012, etc.                           | Do not include an inch indicator (")     |
| Low&nbsp;String&nbsp;Gauge  | ---                 | .056, .078, etc.                           | Do not include an inch indicator (")     |
| Coated                      | Yes                 | ---                                        | If No, do not include this custom field. |

[Back to Accessories](#accessories)

<div style="page-break-after: always;"></div>

## Orchestral Strings

Custom field keys with descriptions and examples

| Custom&nbsp;Field&nbsp;Name | Required&nbsp;Value | Example&nbsp;Values                    | Notes |
| --------------------------- | ------------------- | -------------------------------------- | ----- |
| Instrument&nbsp;Type        | ---                 | Violin, Viola, Cello, Double Bass      | ---   |
| Winding&nbsp;Material       | ---                 | Stainless Steel, Phosphor Bronze, etc. | ---   |
| Core&nbsp;Material          | ---                 | Hexagonal Steel, Round Titanium, etc   | ---   |
| Instrument&nbsp;Size        | ---                 | 1/2, 3/4, 12", 13", etc                | ---   |
| String&nbsp;Name            | ---                 | A, D, G, etc                           | ---   |

[Back to Accessories](#accessories)

<div style="page-break-after: always;"></div>
