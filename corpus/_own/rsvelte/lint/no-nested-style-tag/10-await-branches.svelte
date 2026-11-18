<script>
  let p = Promise.resolve(1);
</script>

{#await p}
  <style>.a { color: red; }</style>
{:then v}
  <style>.b { color: green; }</style>
  <span>{v}</span>
{:catch e}
  <style>.c { color: blue; }</style>
  <span>{e}</span>
{/await}
