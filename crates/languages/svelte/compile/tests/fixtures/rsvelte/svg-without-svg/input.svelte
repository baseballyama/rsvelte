<script>
	let { x = 1, items = [], fill = 'red' } = $props();
</script>

<g class="axis" transform="translate({x}, 0)">
	{#each items as item}
		<line x1={item} x2={item} y2="10" stroke-width="2" />
		<text dominant-baseline="hanging" textLength={10}>{item}</text>
	{/each}
	<linearGradient id="g" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color={fill} /></linearGradient>
</g>
<path d="M0 0" {fill} />
