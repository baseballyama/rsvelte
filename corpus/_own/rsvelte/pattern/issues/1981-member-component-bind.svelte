<script>
	import * as Popover from './popover.js';

	let { open = $bindable(false) } = $props();
</script>

<Popover.Root bind:open />
