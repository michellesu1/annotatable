# annotatable-introlml — MIT 6.390 Notes

**Live website: [annotatable-introlml.vercel.app](https://annotatable-introlml.vercel.app)**

A fork of [390introml/notes](https://github.com/390introml/notes) with text highlights and personal comments. The original course layout, chapter sources, equations, and algorithm rendering are preserved.

Select text, then choose a color or **+ Comment**. Open **My notes** to edit comments or download/restore a backup. Annotations stay in your browser: each browser profile has its own notes, with no shared database or reader accounts. See [ANNOTATIONS.md](ANNOTATIONS.md) for details.

## Host on Vercel

Vercel hosts the rendered book as a static website. Its free Hobby plan can be used for personal, noncommercial projects within its limits.

### One-time setup

1. Clone this fork:

   ```sh
   git clone https://github.com/michellesu1/annotatable.git
   cd annotatable
   ```

2. Install **Quarto 1.6.39**, using the links in [DEV.md](DEV.md). Do not substitute the latest version: the original pseudocode extension requires the MathJax version bundled with this release.
3. Install a TeX distribution as described in [DEV.md], or use `quarto install tinytex`. Make sure `latex` and `dvisvgm` are on your PATH. With TinyTeX, install the diagram packages if necessary:

   ```sh
   tlmgr install standalone pgf pgfplots preview dvisvgm tikzmark
   ```

4. Install Node.js, then sign in to your Vercel account:

   ```sh
   npx vercel login
   ```

### Build and publish

```sh
bash scripts/deploy-vercel.sh
```

The script renders all chapters into `_book/`, copies the static Vercel configuration, and deploys that directory to production. On first deployment, choose your personal Hobby account, create or select the `annotatable-introlml` project, and use the **Other** framework preset. No installation or build command is needed on Vercel because the book was already rendered locally. Use the stable production URL printed by Vercel for studying.

If Quarto is not on your PATH, set its location explicitly:

```sh
QUARTO_BIN=/path/to/quarto bash scripts/deploy-vercel.sh
```

For later changes, edit the source, commit/push to your fork, and run the deployment script again. **A GitHub push alone does not redeploy this local-build setup.** Do not import the raw repository into Vercel with default settings: Vercel needs the rendered `_book/` output, and its default environment does not include this project's Quarto/TeX toolchain. The upstream MIT deployment webhook is disabled for forks.

To preview locally without publishing:

```sh
quarto preview
```

### Move existing highlights to your new URL

On the old site, choose **My notes → Download backup**. On your Vercel site, choose **My notes → Restore backup**. Notes do not automatically transfer between website addresses or devices. Clearing browser site data removes locally saved notes, so keep backups.

## Original course project

Source for the MIT 6.390 course notes, published at [introml.mit.edu/notes](https://introml.mit.edu/notes/).

The notes are a [Quarto](https://quarto.org) book. Chapter sources are the `*.qmd` files at the repo root, in the order listed in `_quarto.yml`; `NOTATION.md` is the course-wide notation guide.

For the original project's build and preview instructions, see [DEV.md](DEV.md). Its discussion of the MIT server deployment applies only to the upstream repository; use the Vercel instructions above for this fork.

Licensed under [CC BY-NC-SA 4.0](LICENSE.md).
