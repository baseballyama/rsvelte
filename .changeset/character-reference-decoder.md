---
"@rsvelte/compiler": patch
---

Match upstream on three character-reference spellings. `&#X41;` is not a reference at all — upstream's `#(?:x[a-fA-F\d]+|\d+)` spells the marker lowercase — where rsvelte decoded it; a surrogate half or an out-of-range code point emits a literal NUL, because upstream calls `String.fromCodePoint(validate_code(code))` and only bails when the parsed code is falsy, where rsvelte read the validated 0 as "leave it undecoded"; and `<textarea>` content decodes through `read_sequence`, which passes `is_attribute_value: true`, so the semicolon-less legacy names (`&notit`) do not apply there. An overlong digit run now saturates instead of failing to parse, matching `parseInt` widening past 2^32 into a value `validate_code` rejects.
