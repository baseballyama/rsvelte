<script lang="ts">
	let w: typeof window;
	let d: Window | null = null;
	const fn = (x: typeof document) => x;
	const real = window.origin;
	void [w, d, fn, real];
</script>
<p>type positions</p>
