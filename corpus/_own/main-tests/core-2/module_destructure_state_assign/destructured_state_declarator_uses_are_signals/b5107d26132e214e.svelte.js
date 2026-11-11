let { a, b } = $state({ a: 1, b: 2 });
b = 5;
export const sum = () => a + b;
