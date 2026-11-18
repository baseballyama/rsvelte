const tag = Symbol("tag");

class Bag {
  items = $state([1]);

  get [Symbol.toStringTag]() {
    return "Bag";
  }

  *[Symbol.iterator]() {
    yield* this.items;
  }

  [tag]() {
    return this.items.length;
  }
}

export const bag = new Bag();

export function read() {
  return `${[...bag]}/${bag[tag]()}/${String(bag)}`;
}
