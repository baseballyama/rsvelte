<script>
	import { services } from './stores.js';
	let plain = $state([{ value: 1 }]);
	let outer = $state({ value: 1 });
</script>

{#each $services.list as service}
	<Toggle bind:value={service.value} />
	<Other bind:value={outer.value} />
{/each}

{#each plain as item}
	<Toggle bind:value={item.value} />
{/each}
