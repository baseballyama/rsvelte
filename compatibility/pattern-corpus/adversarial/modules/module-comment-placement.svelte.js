// leading module comment

/** JSDoc before a rune declarator */
let value = $state(1);

/* block before a function */
export function read() {
  // inside
  return value; // trailing
}

export const view = {
  // inside an object literal
  get value() {
    return value;
  },
};

/* trailing block comment at end of module */
