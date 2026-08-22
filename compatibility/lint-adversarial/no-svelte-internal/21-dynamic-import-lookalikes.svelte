<script>
	const loader = {
		import(spec) {
			return spec;
		}
	};
	// A member call named `import` is not a dynamic import.
	void loader.import('svelte/internal');
	// A boundary miss: `svelte/internalx` is a different package.
	const near = () => import('svelte/internalx');
	void near;
</script>

{#await loader.import('svelte/internal')}
	<p>loading</p>
{:then value}
	<p>{typeof value}</p>
{/await}

<button onclick={() => import('svelte/internal/dom/elements')}>deep</button>
