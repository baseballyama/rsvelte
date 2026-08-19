<script module>
	let exported = 1;
	export { exported };
	export let legacyProp = 2;
	let internal = 3;
	void internal;
</script>
<p>svelte 5 `module` spelling still gets prop references upstream</p>
