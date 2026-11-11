<script>
  const console = { log: () => "shadowed" };
  const window = { inner: 1 };
  const document = { title: "d" };
  const undefined_ = undefined;
  const Math = { max: () => 42 };

  class Holder {
    static for = 1;
    static class = 2;
    #in = 3;

    read() {
      return this.#in;
    }
  }

  const holder = new Holder();
</script>

<b>{console.log()}</b>
<b>{window.inner}{document.title}</b>
<b>{String(undefined_)}</b>
<b>{Math.max()}</b>
<b>{Holder.for}{Holder.class}{holder.read()}</b>
