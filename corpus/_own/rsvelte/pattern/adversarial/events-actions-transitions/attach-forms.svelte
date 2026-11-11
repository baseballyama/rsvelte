<script>
	import Panel from './Panel.svelte';

	let color = $state('red');

	function paint(node) {
		node.style.color = color;
		return () => {
			node.style.color = '';
		};
	}

	function sized(px) {
		return (node) => {
			node.style.fontSize = `${px}px`;
		};
	}
</script>

<div {@attach paint}>direct</div>
<div {@attach sized(14)} {@attach paint}>factory + stacked</div>
<div {@attach (node) => node.setAttribute('data-inline', color)}>inline</div>
<Panel {@attach paint} label="forwarded" />
