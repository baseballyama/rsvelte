// A lone rest parameter is still official's single parameter, so `load` is
// augmented here — with the same `@param` official emits, TS2370 included.
export const load = (...args) => ({ count: args.length });
