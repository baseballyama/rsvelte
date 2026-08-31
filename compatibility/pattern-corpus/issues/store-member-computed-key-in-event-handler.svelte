<script>
	import { writable } from 'svelte/store';
	import Child from './Child.svelte';

	export let entries = [];

	const formData = writable({});
	const scrollTop = writable({});

	let lastHref = '';

	function go(href) {
		lastHref = href;
	}
</script>

{#each entries as [groupKey, label]}
	<Child {label} on:update={(e) => ($formData[groupKey] = e.detail)} />
{/each}

<Child on:scroll={(e) => ($scrollTop[lastHref] = e.detail)} />

<button on:click={() => go('/x')}>go</button>
