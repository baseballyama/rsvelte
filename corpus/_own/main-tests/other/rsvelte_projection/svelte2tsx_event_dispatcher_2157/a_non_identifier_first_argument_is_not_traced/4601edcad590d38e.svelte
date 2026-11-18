<script>
  import { createEventDispatcher } from 'svelte';
  const bla = 'bye';
  const dispatch = createEventDispatcher();
  dispatch(bla.length, false);
  dispatch(other, false);
</script>
