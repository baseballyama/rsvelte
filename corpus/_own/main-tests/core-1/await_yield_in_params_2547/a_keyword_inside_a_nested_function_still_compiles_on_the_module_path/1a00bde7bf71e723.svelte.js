function load() {}
export const f = async (p = function* () { yield 1; }) => p;
