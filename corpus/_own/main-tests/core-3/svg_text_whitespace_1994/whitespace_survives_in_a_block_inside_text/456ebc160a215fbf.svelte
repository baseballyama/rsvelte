<script>let { x } = $props();</script>
<svg>
	<text>{#if x}<tspan>a</tspan> <tspan>b</tspan>{/if}</text>
</svg>
