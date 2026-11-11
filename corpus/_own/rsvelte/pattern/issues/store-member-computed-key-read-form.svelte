<script>
	import Child from './Child.svelte';
	import { writable } from 'svelte/store';

	export let groupKey = 'first';

	const values = writable({ first: '' });
	const rows = writable([{ a: '' }]);
	const key = writable('first');

	let index = 0;
	let editor = { id: 'first' };

	function next() {
		index += 1;
		editor = { id: 'second' };
	}
</script>

<button onclick={next}>next</button>
<Child bind:value={$values[$key]} />
<Child bind:value={$values[groupKey]} />
<Child bind:value={$rows[index].a} />
<Child bind:value={$values[editor.id]} />
