<script lang="ts">
	let {
		children,
		handle, // query
		close,
	} = $props();

	let left = $state(0);
	$effect(() => {});
</script>
<section>{@render children()}</section>