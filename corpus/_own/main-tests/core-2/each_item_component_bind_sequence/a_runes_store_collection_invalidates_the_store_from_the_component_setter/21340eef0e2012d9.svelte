<script>
	import { services } from './stores.js';
	let n = $state(0);
</script>

{#each $services.list as service}
	<Toggle bind:value={service.value} />
{/each}
{n}
