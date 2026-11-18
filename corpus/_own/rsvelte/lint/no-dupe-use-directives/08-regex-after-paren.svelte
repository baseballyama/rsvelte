<script>
	function a(n) { return n; }
	let b = "x";
</script>

<div use:a={() => { if (b) /x/.test(b); }} use:a={() => { if (b) / x /.test(b); }}>t</div>
