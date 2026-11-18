<script>
	import Stage from './S.svelte';
	let stage;
</script>
<Stage bind:handle={stage} f={() => { stage.container().style.cursor = "grab"; }} />