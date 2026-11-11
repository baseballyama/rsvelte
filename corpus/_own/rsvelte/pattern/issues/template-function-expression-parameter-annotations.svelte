<script lang="ts">
  let v = $state(0);
</script>

<button
  onclick={function (
    e: MouseEvent,
    n: number = 1,
    b?: string,
    { c }: { c: number } = { c: 1 },
    ...d: number[]
  ) {
    v = n + c + d.length + e.button;
  }}>{v}</button
>
<p>
  {{
    m(a: number = 1) {
      return a;
    },
  }.m()}
</p>
