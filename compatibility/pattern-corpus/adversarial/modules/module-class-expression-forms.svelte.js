const Anonymous = class {
  v = $state(1);
};

const Named = class Inner {
  v = $state(2);

  self() {
    return Inner;
  }
};

const Extending = class extends Anonymous {
  w = $state(3);
};

export const parenthesised = new (class {
  v = $state(4);
})();

export const instances = [new Anonymous(), new Named(), new Extending()];

export function read() {
  return instances.map((i) => i.v).join("/") + parenthesised.v;
}
