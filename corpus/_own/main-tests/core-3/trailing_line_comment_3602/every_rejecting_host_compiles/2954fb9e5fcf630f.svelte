<script>
	let flag = $state(true);
	let rows = $state([1]);
</script>

{#if flag}
	<b>a</b>
{:else if flag // c
}
	<b>b</b>
{/if}
