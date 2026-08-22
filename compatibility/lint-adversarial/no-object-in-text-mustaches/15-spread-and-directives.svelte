<script>
	import C from './01-basic.svelte';
	let a = 1;
	let color = 'red';
</script>

<C {...{ a }} />
<div style:color="{color}{[a]}"></div>
<div on:click={() => a}></div>
<div use:noop={{ a }}></div>

<script context="module">
	export function noop() {}
</script>
