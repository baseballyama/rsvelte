<script>
	export let k;
	let o = { sel: 0 };
	let arr = [0];
	let pobj = { sel: 0 };
	$: arr[0] = (() => { o.sel = k || 1; }, 1);
</script>
<p>{o.sel}{arr[0]}{pobj.sel}{k}</p>
