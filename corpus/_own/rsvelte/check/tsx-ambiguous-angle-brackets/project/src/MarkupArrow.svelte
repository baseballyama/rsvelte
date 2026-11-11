<script lang="ts">
	let items = [1, 2, 3];
</script>

<p>{(<T>(a: T) => a)(1)}</p>
<button onclick={<E>(e: E) => e}>go</button>
{#each items as item}
	{@const twice = <T>(a: T) => [a, a]}
	<span>{twice(item).length}</span>
{/each}
<p>{(<T>(a: T) => a)('s').toFixed(2)}</p>
