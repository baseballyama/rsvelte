---
'@rsvelte/compiler': patch
---

`parse()`: a dynamic `import()` inside a template expression now reports `options` and `ts` like the script path does, and `css.content.comment` stores the preceding HTML comment node instead of its text
