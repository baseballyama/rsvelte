<svelte:options customElement={{ tag: "my-x" }} />

<script lang="ts">
	function f<T>(): any { return 1; }
	function g(x: any): any { return x; }
	let { p = (x: number) => x } = $props();
</script>

<b>{typeof p}</b>
