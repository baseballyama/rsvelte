<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  dispatch(bla, false);
  const bla = 'bye';
</script>
