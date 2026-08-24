---
"@rsvelte/compiler": patch
---

`a11y_media_has_caption` now reads only the first `<track>` child of a `<video>`, as upstream does (`nodes.find(...)`). rsvelte ran the caption predicate over every `track` child, so a `<video>` whose caption track is not the first one stayed silent where the official compiler warns. `find` and `any` agree whenever there is exactly one `<track>`, which is the shape every earlier test used.
