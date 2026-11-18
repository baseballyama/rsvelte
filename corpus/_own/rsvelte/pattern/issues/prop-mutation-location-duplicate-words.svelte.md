# `prop-mutation-location-duplicate-words.svelte`

**Issue:** [#4026](https://github.com/baseballyama/rsvelte/pull/4026)

Legacy prop member assignments behind TypeScript assertions retain the assertion's opening position when dev ownership validation is generated. Repeated property names and computed/static member forms pin position-based matching rather than a text search.
