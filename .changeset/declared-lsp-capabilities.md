---
"@rsvelte/language-server": patch
---

Declare the language-server capabilities the server already answers. Completion now advertises the TypeScript and Emmet trigger characters (`.` above all, so member completion opens on its own instead of only on an explicit request) as well as `labelDetailsSupport`; `source.addMissingImports` joins the advertised code-action kinds it was already serving; pull diagnostics declare `interFileDependencies`, so editing an imported module refreshes the reports that depend on it; and `prepareProvider` is offered only to a client that advertised prepare support.
