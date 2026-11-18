<script>
import { writable } from 'svelte/store';
const café = 1;
const s = writable(0);
$: total = $s + café;
</script>
{total}