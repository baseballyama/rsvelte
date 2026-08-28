<script>
	import { writable } from 'svelte/store';

	const translate = writable((key) => key);
</script>

<svelte:options runes={false} />

<svelte:head>
	<title>{$translate('page.title')} — site</title>
</svelte:head>
