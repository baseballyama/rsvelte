<script>
	import C from "./C.svelte";
</script>
{#snippet s()}
	<span class="b"></span>
{/snippet}
<div class="a"><C icon={s} /></div>
<style>
	.a { .b { color: red } }
</style>
