<script lang="ts">
	let element: HTMLInputElement | null = null;

	function focus() {
		element!.focus();
	}
</script>

<input bind:this={element} />
<button onclick={focus}>focus</button>
