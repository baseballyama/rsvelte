<script>
	import C from './C.svelte';

	let x = $state(1);
</script>

<C bind={x} on={x} use={x} transition={x} animate={x} style={x} class={x} let={x} />
<div data-bind="literal" data-on:click="nope" title="use:fake"></div>
<p>{x}</p>
