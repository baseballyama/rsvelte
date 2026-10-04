<script>
  import Child from '../props-defaults-child/input.svelte';
  let object = $state(undefined);
  let list = $state(undefined);
</script>
<button class="provide" onclick={() => { object = { count: 20 }; list = [30]; }}>provide</button>
<button class="clear" onclick={() => { object = undefined; list = undefined; }}>clear</button>
<Child {object} {list} />
