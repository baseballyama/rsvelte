<script>
	export const PKG = 'svelte/internal';
	export let DEEP = 'svelte/internal/client';
	void [PKG, DEEP];
</script>
<p>bare export with a matching string initializer is not an import</p>
