<script>
  import { writable } from 'svelte/store';

  const count = writable(0);
  const current = $count;
  const unused = 1;
</script>

<p>{current}</p>