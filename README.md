# Fluoro

Riso-fy (almost) anything.

Fluoro is a small toolkit for faking risograph prints in the browser. It shows three ways to get the look, all driven by the same inks and settings:

1. **Canvas pipeline** for images: separate an image into ink layers, screen each layer to 1-bit, tint, and multiply onto paper.
2. **CSS layout** built like a print: flat ink layers, `mix-blend-mode: multiply`, a misregistered second pass on the headline, and a paper grain overlay.
3. **SVG filter** that riso-fies live DOM by doing the same separation, threshold, tint and multiply inside the browser's filter pipeline.

No build step and no dependencies.

## Run it

Open `index.html` in a browser. The scripts are plain classic scripts, so it works from `file://`. Fonts load from Google Fonts and fall back to system fonts when offline.

## Project structure

```
index.html        markup for the press panel, the layout demo and the filter demo
css/styles.css    riso layout styles and page chrome
js/util.js        element lookup, color math, seeded noise
js/state.js       the shared settings object
js/screens.js     Bayer matrix and the rotated dot screen
js/pipeline.js    ink layers (screen to 1-bit) and multiply compositing
js/scene.js       built-in sample image, drawn with canvas paths
js/filter.js      SVG filter builder
js/app.js         source image, rendering, controls, wiring
```

Scripts load in the order listed in `index.html` and share global scope, so keep that order when adding files.

## How the canvas pipeline works

1. **Pick two inks.** Each ink is matched to the color channel it absorbs most (the lowest value in its RGB). Pink reads the green channel, blue reads the red one. If both inks pick the same channel, the second one takes the next channel.
2. **Coverage maps.** Each channel is inverted so 1 means full ink, then a contrast curve is applied.
3. **Screening.** A coverage map becomes 1-bit by comparing it to a threshold: a rotated dot screen (halftone), an 8x8 Bayer matrix (dither), or random noise. The two layers use different angles (15 and 75 degrees plus the angle slider), and a little seeded noise is added to the threshold.
4. **Overprint.** Each layer is painted in its ink color and drawn onto a paper-colored canvas with `multiply`, with a small offset (misregistration) and ink opacity below 1.

## Settings

| Setting | What it does |
| --- | --- |
| Inks | Two color pickers and three presets. They also recolor the whole page. |
| Screen | Halftone dots, Bayer dither, or random grain. |
| Cell size | Size of one halftone cell or dither step. |
| Screen angle | Rotates both halftone screens. |
| Contrast | Steepens or flattens each coverage map. |
| Threshold grain | Noise added to the threshold. |
| Misregistration | Pixel offset of the second ink. Also drives the headline and the filter. |
| Ink opacity | Alpha of each layer before multiply. |
| Reprint | Draws new noise, like pulling another print. |

## Notes and limits

- The SVG filter re-runs on every repaint, so it is best on a section rather than a whole site. Safari is the least reliable with large filtered elements. A filter on a parent also changes how `position: fixed` children behave.
- The filter produces grain rather than true halftone dots. Use the canvas pipeline when you need dots.
- Uploaded images are downscaled to 640px on the long side and never leave the browser.

## Ideas

- Export each separation as a black 1-bit PNG at 300 or 600 dpi for real riso printing.
- Add a third ink layer.
- Bookmarklet or extension that injects the filter into any page.
- Pick a palette from the image (k-means) instead of using presets.
