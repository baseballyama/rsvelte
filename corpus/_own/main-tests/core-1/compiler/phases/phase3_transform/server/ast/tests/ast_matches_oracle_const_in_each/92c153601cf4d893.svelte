<svelte:options runes={false} />
<script>export let nums = [1, 2];
	let foos = [{ nums: [1, 2, 3] }];</script>
{#each nums as num, index}
	{@const bar = nums.map((num) => {
		return (function (foos, num) {
			return [...foos.map((foo) => foo), num];
		})(foos[index].nums, num);
	})}
	<p>bar: {bar}, num: {num}</p>
{/each}