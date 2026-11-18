<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  function bye() {
    const bla = 'bye';
    dispatch(bla, false);
  }
</script>
