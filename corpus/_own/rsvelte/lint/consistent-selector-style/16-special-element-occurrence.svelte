<script>
	/* eslint svelte/consistent-selector-style: ["warn", { style: ["id", "class", "type"] }] */
	import Foo from './Foo.svelte';
</script>

<svelte:component this={Foo}><span>a</span></svelte:component>

<style>
	span {
		color: red;
	}
</style>
