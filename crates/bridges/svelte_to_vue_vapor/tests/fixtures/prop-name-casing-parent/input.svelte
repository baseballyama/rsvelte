<script>
  import Child from '../prop-name-casing-child/input.svelte';
  let value = $state('first');
  let received = $state('none');
</script>
<button onclick={() => value = 'second'}>change</button>
<Child A={value} camelCase={value.toUpperCase()} onChange={(next) => received = next} />
<p>{received}</p>
