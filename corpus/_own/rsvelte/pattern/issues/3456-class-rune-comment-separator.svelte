<script>
  class Box {
    value = /* keep */ $state(0);
    #hidden = /* keep */ $state(1);
    raw = /* keep */ $state.raw(2);
    doubled = /* keep */ $derived(this.value * 2);
    lazy = /* keep */ $derived.by(() => this.value + 1);
    "a-b" = /* keep */ $state(3);

    constructor() {
      this.extra = /* keep */ $state(4);
    }

    read() {
      return this.#hidden;
    }
  }

  const Expr = class {
    value = /* a */ /* b */ $state(5);
  };

  const box = new Box();
  const expr = new Expr();
</script>

<b>
  {box.value}
  {box.raw}
  {box.doubled}
  {box.lazy}
  {box["a-b"]}
  {box.extra}
  {box.read()}
  {expr.value}
</b>
