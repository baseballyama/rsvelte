<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{hi: boolean;}>();
  dispatch('nope', true);
</script>
