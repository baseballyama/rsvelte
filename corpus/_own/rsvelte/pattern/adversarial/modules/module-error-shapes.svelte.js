class Custom extends Error {
  name = "Custom";
  code = $state(0);

  constructor(message, options) {
    super(message, options);
    this.code = 1;
  }
}

export function run(fn) {
  try {
    return fn();
  } catch (error) {
    if (error instanceof Custom) return error.code;
    throw new Custom("wrapped", { cause: error });
  } finally {
    void 0;
  }
}

export function bare() {
  try {
    throw new Custom("x");
  } catch {
    return -1;
  }
}
