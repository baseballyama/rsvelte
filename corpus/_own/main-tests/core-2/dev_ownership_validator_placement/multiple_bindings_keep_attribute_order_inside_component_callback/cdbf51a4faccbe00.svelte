<script>
	import * as Popover from './popover.js';
	let { open = $bindable(false), value = $bindable('') } = $props();
</script>

<Popover.Root bind:open bind:value />