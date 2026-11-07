<script>
	import { fade, fly } from 'svelte/transition';
	let visible = true;
	const foo = { fade, fly }
</script>

<label>
	<input type="checkbox" bind:checked={visible}>
	visible
</label>

{#if visible}
	<p out:foo.fade>
		Flies in, fades out
	</p>
{/if}

<!-- Treat it as a compile error, as it will be a run-time error. -->

<!-- https://svelte.dev/repl/4d94297a6c80488595e1e1fd7558d081?version=3.52.0 -->
