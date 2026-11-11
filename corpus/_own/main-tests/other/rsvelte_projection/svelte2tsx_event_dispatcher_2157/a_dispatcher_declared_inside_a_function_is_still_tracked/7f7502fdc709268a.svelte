<script>
  import { createEventDispatcher } from 'svelte';
  function setup() {
    const dispatch = createEventDispatcher();
    dispatch('hi', true);
  }
</script>
