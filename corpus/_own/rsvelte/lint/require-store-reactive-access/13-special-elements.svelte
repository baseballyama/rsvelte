<script>
	import { writable } from 'svelte/store';

	const s = writable('div');
</script>

<svelte:element this={s} data-x={s}>t</svelte:element>
<svelte:component this={s} />
