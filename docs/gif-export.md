# GIF Export Feature

This document describes the GIF export functionality added to the CombatScene.

## Overview

The CombatScene now includes the ability to export the combat animation as a GIF file. This feature captures frames from the combat scene and encodes them into an animated GIF that can be downloaded and shared.

## Features

### Built-in Export Button
- A green "Export GIF" button appears in the top-right corner of the combat scene
- Click to start recording, click again to stop and download
- Button changes color and text to indicate recording status:
  - Green: "Export GIF" (ready to start)
  - Red: "Stop Export" (currently recording)
  - Orange: "Processing..." (generating GIF)

### Programmatic Export
You can also export GIFs programmatically using the `exportToGif()` method:

```typescript
// Export with default settings (3 seconds, 10 FPS)
const gifBlob = await combatScene.exportToGif();

// Export with custom settings
const gifBlob = await combatScene.exportToGif({
    width: 800,
    height: 600,
    duration: 5,
    framerate: 15,
    quality: 5
});

// Download the generated GIF
GifExporter.downloadBlob(gifBlob, 'my-combat.gif');
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | number | 400 | Width of the exported GIF in pixels |
| `height` | number | 300 | Height of the exported GIF in pixels |
| `duration` | number | 3 | Recording duration in seconds |
| `framerate` | number | 10 | Frames per second in the output GIF |
| `quality` | number | 10 | Quality setting (1-20, lower is better) |
| `workers` | number | 2 | Number of web workers for encoding |

## Implementation Details

### GifExporter Class
The `GifExporter` class (`src/utils/GifExporter.ts`) handles the core functionality:
- Frame capture from PixiJS containers
- GIF encoding using the gif.js library
- Progress tracking and error handling

### Integration
The export functionality is integrated into `CombatScene` (`src/ui/CombatScene.ts`):
- Export button UI creation and management
- Recording state management
- User interaction handling

## Dependencies

- **gif.js**: Browser-based GIF encoding library
- **PixiJS**: Used for frame capture via RenderTexture and extract

## Browser Compatibility

The GIF export feature works in all modern browsers that support:
- Web Workers
- Canvas API
- HTML5 File API (for downloads)

## Performance Notes

- GIF generation is CPU-intensive and runs in web workers to avoid blocking the UI
- Larger dimensions and higher framerates will increase processing time
- Quality setting significantly affects both file size and processing time

## Example Usage

```typescript
import { CombatScene } from './ui/CombatScene';
import { GifExporter } from './utils/GifExporter';

// Create combat scene
const combatScene = new CombatScene();

// Export a 5-second GIF at high quality
const gifBlob = await combatScene.exportToGif({
    duration: 5,
    framerate: 15,
    quality: 5,
    width: 800,
    height: 600
});

// Download the result
GifExporter.downloadBlob(gifBlob, 'epic-combat.gif');
```