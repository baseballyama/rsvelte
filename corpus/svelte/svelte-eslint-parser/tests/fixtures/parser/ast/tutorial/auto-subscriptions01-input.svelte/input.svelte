<script>
	import { onDestroy } from 'svelte';
	import { count } from './stores.js';
	import Incrementer from './Incrementer.svelte';
	import Decrementer from './Decrementer.svelte';
	import Resetter from './Resetter.svelte';

	let count_value;

	const unsubscribe = count.subscribe(value => {
		count_value = value;
	});
	onDestroy(unsubscribe);
</script>

<h1>The count is {$count}</h1>

<Incrementer/>
<Decrementer/>
<Resetter/>
