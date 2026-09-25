# Personal highlights and comments

This fork adds pastel highlights and passage comments to the original MIT 6.390 Quarto book. Chapter sources, themes, equation rendering, pseudocode filters, and figures are unchanged.

Select a passage and choose a color in the bottom toolbar, or choose **+ Comment**. Open **My notes** to return to a passage, edit its comment, remove an annotation, or download/restore a backup.

Notes stay in each visitor's browser profile. They are not sent to GitHub, Vercel, the course server, or a shared database. Different browsers have independent notes; people using the same browser profile share its notes. Clearing site data removes its saved annotations. Cross-device synchronization is not included.

Before moving to a new hosting address, use **My notes → Download backup** on the old address, then **My notes → Restore backup** on the new one. Browser storage does not move automatically between domains. Backups from the earlier study site are supported.

## Integration

- `assets/annotations.html`: the toolbar, notes panel, and comment dialog.
- `assets/annotations.css`: styles scoped to those controls, with extra space at the bottom of the page.
- `assets/annotations.js`: selection ranges, CSS highlights, comments, and local backup/restore.
- `_quarto.yml`: includes these assets on every chapter.

The script does not replace or wrap course text or equation elements. It uses the browser's CSS Custom Highlight API and stores each annotation's chapter, text quote, and character offsets. If a passage moves after rebuilding the book, the script looks for its saved quote. A removed or rewritten passage may require annotating again.

Use an up-to-date browser supporting CSS Custom Highlights. The original publisher's deployment webhook is restricted to the original repository, so pushes to a fork cannot call it.

## Build and hosting

Follow `DEV.md` and use **Quarto 1.6.39**, including the documented TeX dependencies. Keep that version: the upstream project documents a pseudocode incompatibility with newer Quarto/MathJax versions.

```sh
quarto render
```

The rendered website is in `_book/`, including the annotation assets. Upload/deploy the contents of that directory to a static host. For Vercel CLI, after signing in, run:

```sh
npx vercel _book --prod
```

Select the Other framework preset with no install or build command when deploying this already-rendered directory. Importing the raw Quarto repository into Vercel without a Quarto/TeX build environment will not build the book. A static-host deployment must use the rendered `_book/` output, not the earlier standalone `dist/` project.

All original attribution and the CC BY-NC-SA 4.0 license remain in place. This fork's modification is the personal annotation feature.
