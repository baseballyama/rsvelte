<script>
  import Child from '../props-rest-child/input.svelte';
  import Whole from '../props-object/input.svelte';
  let count = $state(2);
  let label = $state('first');
  let extra = $state(true);
</script>
<button onclick={() => { count++; label = 'next'; extra = !extra; }}>update</button>
<Child {label} {count} {...extra ? { extra: 'yes' } : {}} />

<Whole {label} {count} {...extra ? { extra: 'yes' } : {}} />
