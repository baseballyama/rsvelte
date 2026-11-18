<script>
	let v = 1;
	function z(){}
	function act(){}
</script>
<div use:act={() => {
	/* C */
	if (v) { z(); }
}}></div>
