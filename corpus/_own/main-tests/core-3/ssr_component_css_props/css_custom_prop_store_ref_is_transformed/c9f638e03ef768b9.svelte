<script>
import { writable } from 'svelte/store';
import Child from './Child.svelte';
const theme = writable('red');
</script>
<Child --color={$theme} />