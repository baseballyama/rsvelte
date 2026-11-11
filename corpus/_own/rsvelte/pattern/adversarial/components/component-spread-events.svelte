<script>
	import Widget from './Widget.svelte';

	let handlers = $state({
		onclick: () => console.log('c'),
		onkeydown: (e) => console.log(e.key),
	});
	let flags = $state({ disabled: false, 'aria-busy': 'true' });
</script>

<Widget {...handlers} {...flags} onclick={() => console.log('override')} />
<button {...handlers} {...flags}>native</button>
<svelte:element this={'button'} {...handlers}>dyn</svelte:element>
