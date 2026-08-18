<script>
	let x = 1;
</script>

<div title="a = b" id = "real">decoy equals inside a value</div>
<div title="= leading" data-x={x === 1}>equals inside expression</div>
<div data-cond={x == 1 ? 'a' : 'b'}>no report</div>
