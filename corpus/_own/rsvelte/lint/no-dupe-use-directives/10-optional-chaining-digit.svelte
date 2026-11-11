<script>
	function a(n) { return n; }
	let p = 1;
	let q = 2;
</script>

<div use:a={p?.5:q} use:a={p ? .5 : q}>t</div>
