<script context="module">
	const load = 1;
	export function loader() {
		return load;
	}
	function localLoad() {}
	export { localLoad as load };
	// export function load() {}
	const s = 'export const load = 1';
	void s;
</script>
<p>decoys</p>
