<script>
	import Stage from './S.svelte';
	let stage;
	function go(){ stage.container().style.cursor = "grab"; }
</script>
<Stage bind:handle={stage} on:x={go} />