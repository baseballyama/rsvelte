<script>
  let v = '';
  let rest = { name: 'x' };
</script>

<input bind:value={v} type="checkbox" />
<input {...rest} type="radio" bind:value={v} />
<input
  class="a"
  bind:value={v}
  data-x="1"
  type="checkbox"
  disabled
/>
