<script>
	import { services } from './stores.js';
</script>

{#each $services.list as service}
	<Toggle bind:value={service.value} />
{/each}
