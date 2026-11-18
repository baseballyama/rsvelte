<script>
	export let labelId = "";
	function set() { labelId = "x"; }
</script>

<button onclick={set}>{labelId}</button>
