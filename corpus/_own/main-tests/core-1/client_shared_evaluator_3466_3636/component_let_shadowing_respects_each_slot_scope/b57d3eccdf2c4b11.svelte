<script>
	import Counter from './Counter.svelte';
	let count = 'outer';
</script>
<Counter let:count>
	{count}
	<p slot="named">named {count}</p>
</Counter>
