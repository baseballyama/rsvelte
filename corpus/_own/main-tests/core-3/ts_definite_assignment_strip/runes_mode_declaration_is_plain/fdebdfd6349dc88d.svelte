<script lang="ts">
	let element!: HTMLDivElement;
	$effect(() => console.log(element));
</script>

<div bind:this={element}></div>
