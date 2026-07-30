<script>
	import * as Input from './input.js';

	let { ...rest } = $props();
	let value = $state('');
</script>

<Input.Root {...rest} bind:value />
