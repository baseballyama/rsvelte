<script>
  import { getX } from './x.js';
  const x = $derived(getX());
</script>
<span>{x}</span>