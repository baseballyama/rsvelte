<script>
	import { writable } from 'svelte/store';

	const t = writable((k) => k);

	export let prop = { kind: '', tz: null };
	let lodging = { type: '', tz: null };
	let allDay = false;

	$: lodging.tz = allDay ? null : 'x';
	$: prop.tz = allDay ? null : 'y';
	$: if (allDay) {
		lodging.kind = 'plane';
	}

	function outside() {
		lodging.tz = 'z';
	}
</script>

<button on:click={outside}>go</button>

<select bind:value={lodging.type}>
	<option value="hotel">{$t('hotel')}</option>
</select>

<select bind:value={prop.kind}>
	<option value="hotel">{$t('hotel')}</option>
</select>
