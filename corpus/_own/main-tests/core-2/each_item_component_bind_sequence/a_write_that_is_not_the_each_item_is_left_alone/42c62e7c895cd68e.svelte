<script>
	import { services } from './stores.js';
	let outer = $state({ value: 1 });
</script>

{#each $services.list as service}
	<Other bind:value={outer.value} />
{/each}
