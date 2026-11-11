// #2055 (4): `findExports` only recognises a single-declarator
// `export const x = ...` — `export const a = ..., b = ...;` isn't looked up
// under either name, so neither export gets augmented. `load`'s `event` must
// stay implicit `any` here (and raise TS7006 under `strict`) on both the
// official checker and rsvelte-check.
export const prerender = true, load = async (event) => ({ ok: true, params: event.params });
