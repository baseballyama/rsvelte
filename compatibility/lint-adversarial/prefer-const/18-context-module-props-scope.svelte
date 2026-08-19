<script context="module">
	let exported = 1;
	export { exported };
	export let legacyProp = 2;
	let internal = 3;
	void internal;
</script>
<p>legacy `context="module"` is the one spelling upstream skips</p>
