<script>
	let { cond, un } = $props();
	let obj = $state({ a: 0 });
	const assigned = (obj.a = 1);
	const sequenced = (un, 1);
	let title = cond + 1;
</script>

<svelte:head><title>{title}</title></svelte:head>

<select>
	<option value={() => 1}>arrow</option>
	<option value={function () {}}>function</option>
	<option value={1 + 1}>binary</option>
	<option value={-1}>unary</option>
	<option value={{}}>unknown control</option>
</select>

{assigned}{cond}
{sequenced}{cond}
