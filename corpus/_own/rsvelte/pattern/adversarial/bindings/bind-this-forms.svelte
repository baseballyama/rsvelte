<script>
	let one = $state();
	let group = $state({ named: null, list: [] });
	let i = $state(0);
</script>

<div bind:this={one}>a</div>
<span bind:this={group.named}>b</span>
{#each [0, 1] as k}
	<i bind:this={group.list[k]}>{k}</i>
{/each}
<button bind:this={group.list[i + 1]}>c</button>
