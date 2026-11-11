<script>
	import Checkbox from './Checkbox.svelte';

	let options = $state({ vim: false });
</script>

<Checkbox bind:checked={options.vim} />
