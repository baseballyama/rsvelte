<script>
	export let mystore;
	function f() { return /\$mystore/; }
</script>
<b>{mystore}{f()}</b>
