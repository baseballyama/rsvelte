<script>
  import Preview from './Preview.svelte';
  import State from './State.svelte';
</script>

<Preview>
  <State let:value={xDomain} let:set>
    {xDomain}
  </State>
</Preview>
