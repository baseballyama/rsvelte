<script>
	import Chart from './Chart.svelte';
</script>

<svg>
	{#snippet link()}
		<a href="/x"><tspan>x</tspan></a>
	{/snippet}
	{@render link()}
</svg>

<Chart>
	<a href="/y"><circle r="1" /></a>
</Chart>
<a href="/z"><b>z</b></a>
