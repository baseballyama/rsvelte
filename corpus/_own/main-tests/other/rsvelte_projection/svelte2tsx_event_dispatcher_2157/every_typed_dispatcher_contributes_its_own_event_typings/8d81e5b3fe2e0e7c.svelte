<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch1 = createEventDispatcher<{hi: boolean;}>();
  const dispatch2 = createEventDispatcher<{btn: string;}>();
</script>
