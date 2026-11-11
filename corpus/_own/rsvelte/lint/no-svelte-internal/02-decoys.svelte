<script>
	import { mount } from 'svelte';
	import intern from 'svelte-internal';
	import plural from 'svelte/internals';
	const s = "import { x } from 'svelte/internal'";
	const t = `svelte/internal`;
	// import 'svelte/internal'
	/* export * from 'svelte/internal' */
	void [mount, intern, plural, s, t];
</script>
<p>decoys</p>
