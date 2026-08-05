---
"@rsvelte/compiler": patch
---

Match each dev ownership mutation to its own source position by member path, so a `$:` statement moved into a `legacy_pre_effect` no longer takes the line:column of whichever mutation prints before it
