<script>
	import Nested from './Nested.svelte';

	export let letters = ['a', 'b', 'c'];
</script>

<Nested items={letters} let:index>
	<input bind:value={letters[index]}>
</Nested>
