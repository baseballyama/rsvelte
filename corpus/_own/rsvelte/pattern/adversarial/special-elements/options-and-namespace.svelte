<svelte:options runes={true} namespace="svg" css="injected" />

<script>
	let { r = 4 } = $props();
</script>

<g class="wrap">
	<circle cx="5" cy="5" {r} />
	<text x="0" y="9">{r}</text>
	<foreignObject width="10" height="10">
		<div xmlns="http://www.w3.org/1999/xhtml">html inside svg</div>
	</foreignObject>
</g>

<style>
	.wrap {
		fill: none;
	}
	circle {
		stroke: black;
	}
</style>
