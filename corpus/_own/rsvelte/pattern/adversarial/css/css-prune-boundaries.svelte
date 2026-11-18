<script>
	import Child from './Child.svelte';
	let cls = $state('dyn');
</script>

<div class="kept {cls}">
	<Child class="passed" />
	<p class="inner">x</p>
</div>
<span class:toggled={cls === 'dyn'}>y</span>
<div {...{ class: 'spread-only' }}>z</div>

<style>
	.kept .inner { color: red; }
	.kept > :global(.passed) { color: blue; }
	.toggled { color: green; }
	.spread-only { color: teal; }
	.never-used { color: pink; }
	.kept .never-used-child { color: gold; }
	:global(.g) .kept { color: olive; }
	.kept:not(.absent) { color: navy; }
	.kept:has(.inner) { color: maroon; }
	* { box-sizing: border-box; }
	:root { --x: 1; }
	@keyframes spin { from { opacity: 0; } to { opacity: 1; } }
	.kept { animation: spin 1s; }
</style>
