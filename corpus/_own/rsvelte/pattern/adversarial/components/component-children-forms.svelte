<script>
	import Child from './Child.svelte';

	let n = $state(1);
</script>

<Child>text only</Child>
<Child>{n}</Child>
<Child>
	{#snippet header()}<b>h</b>{/snippet}
	body {n}
</Child>
<Child children={() => 'as-a-prop'} />
<Child>{#if n}<i>i</i>{/if}</Child>
<Child></Child>
<Child />
