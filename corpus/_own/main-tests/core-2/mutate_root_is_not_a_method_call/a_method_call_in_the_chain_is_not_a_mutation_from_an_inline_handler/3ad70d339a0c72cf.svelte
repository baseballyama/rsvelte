<script>
	let stage;
</script>
<div bind:this={stage} on:mouseenter={() => { stage.container().style.cursor = "grab"; }}></div>