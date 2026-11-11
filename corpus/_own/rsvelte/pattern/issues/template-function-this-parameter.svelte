<script lang="ts">
  let v = $state("");
  const o = { m: (n: number) => n };
</script>

<input
  onblur={function (this: HTMLInputElement) {
    v = this.value;
  }}
/>
<input
  onfocus={function (this: HTMLInputElement, e: FocusEvent) {
    function g(this: Window, n: number) {
      return n;
    }
    v = this.value + g.call(window, e.detail);
  }}
/>
<p>
  {{
    m(this: typeof o, n: number) {
      return this.m(n);
    },
  }.m.call(o, 1)}
</p>
