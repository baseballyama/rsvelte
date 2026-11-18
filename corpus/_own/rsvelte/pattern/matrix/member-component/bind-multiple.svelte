<script>
	import * as Select from './select.js';

	let open = $state(false);
	let value = $state('');
</script>

<Select.Root bind:open bind:value />
