<script>
	import * as Tabs from './tabs.js';

	let value = $state('a');
</script>

<Tabs.Root bind:value>
	{#snippet children()}
		<span>{value}</span>
	{/snippet}
</Tabs.Root>
