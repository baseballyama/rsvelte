<script>
	let b = "x";
</script>

<button type="button" on:click={() => { if (b) /x/.test(b); }} on:click={() => { if (b) / x /.test(b); }}>go</button>
