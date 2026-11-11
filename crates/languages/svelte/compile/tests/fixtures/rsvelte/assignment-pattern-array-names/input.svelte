<script>
	let cheese = $state(['a', 'b']);
	let other = [1, [2, 3]];
	export function swap(a, b) {
		let x, y, z;
		[x, [y, z]] = other;
		({ x, y: [z] } = { x: 1, y: [2] });
		for ([x, y] of [[1, 2]]) {}
	}
</script>

{#each cheese as cheese}
	<li>{cheese}</li>
{/each}
