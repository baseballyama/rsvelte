<script>
	import { writable } from 'svelte/store';
	import { page } from '$app/stores';
	let { store } = $props();
	const count = writable(0);
	let obj = writable({ a: 1 });
	function inc() { $count += 1; $count++; $obj.a = 2; $obj = { a: 3 }; }
	let d = $derived($count * 2);
	console.log($page.url);
</script>
<p>{$count} {$store} {$obj.a} {d}</p>
<input bind:value={$count} />
<button onclick={() => $count = 5}>x</button>
{#each $obj.list as item}{item}{/each}
