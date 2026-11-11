<script>
	import Checkbox from './Checkbox.svelte';

	let { workspace } = $props();
</script>

<Checkbox bind:checked={workspace.vim} />
