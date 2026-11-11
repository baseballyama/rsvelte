import { tick } from 'svelte';

let count = 0;
$: tick().then(() => {
	count += 1;
});
void count;
