class Base {
  value = $state(1);

  describe() {
    return `base:${this.value}`;
  }
}

class Middle extends Base {
  extra = $state(2);

  describe() {
    return `middle:${super.describe()}:${this.extra}`;
  }
}

class Leaf extends Middle {
  #secret = $state(3);
  total = $derived(this.value + this.extra + this.#secret);

  describe() {
    return `leaf:${super.describe()}:${this.total}`;
  }
}

export const leaf = new Leaf();
