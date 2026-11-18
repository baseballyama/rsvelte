<script lang="ts">
	let element!: HTMLDivElement;
	let count = $state(0);
</script>

<div bind:this={element}>{count}</div>
