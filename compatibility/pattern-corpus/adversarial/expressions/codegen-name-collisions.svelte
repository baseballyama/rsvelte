<script>
	let root = $state('r');
	let anchor = $state('a');
	let text = $state('t');
	let node = $state('n');
	let frag = $state('f');
	let template = $state('tpl');
	const child = $derived(root + anchor);
</script>

<div>{root}{anchor}</div>
<span>{text}{node}{frag}{template}{child}</span>
