<script>
	import * as Accordion from './accordion.js';

	let { open = $bindable(false) } = $props();
</script>

<Accordion.Item bind:open />
