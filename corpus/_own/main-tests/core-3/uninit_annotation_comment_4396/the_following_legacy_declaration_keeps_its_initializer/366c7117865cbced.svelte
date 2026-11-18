<script lang="ts">
	let stats: {
		// Legacy fields
		b: number;
	} | null;
	let user = 0;
	function bump() { user += 1; }
</script>
<i on:click={bump}>{user}</i>
