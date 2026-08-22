---
"@rsvelte/language-server": patch
---

Ship the VS Code extension as one VSIX per platform.

The extension bundled all five native language servers — ~110 MB uncompressed,
including a 24 MB unsigned Windows PE — into a single universal VSIX, and every
release since 0.5.0 failed the Marketplace's virus check on upload. Open VSX,
which does not scan, carried 0.5.0/0.5.1/0.5.2 while the Marketplace stayed on
0.4.1 and has since dropped the extension entirely.

Each platform now gets its own VSIX carrying only its own server, alongside a
binary-free universal package that the registries serve to every other platform,
where the extension falls back to the bundled JS server as before. The publish
guard also became per `(version, targetPlatform)`: one platform failing
validation no longer reads as "published" for the rest, so the next run retries
exactly what is missing.
