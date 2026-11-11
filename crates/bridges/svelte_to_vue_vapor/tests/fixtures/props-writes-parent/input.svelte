<script>
  import Child from '../props-writes-child/input.svelte';
  let value = $state(2);
  let other = $state(3);
</script>
<p>{value}/{other}</p>
<button class="parent" onclick={() => { value += 10; other += 10; }}>parent</button>
<Child {value} {other} />
