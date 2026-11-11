<script>
	function a(n) { return n; }
</script>

<div use:a={() => {
	// c globalThis.x = 1;
}} use:a={() => {
}}>t</div>
