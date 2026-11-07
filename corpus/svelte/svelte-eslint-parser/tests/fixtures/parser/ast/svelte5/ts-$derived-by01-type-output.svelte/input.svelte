<script lang="ts">
	const numbers = $state([1, 2, 3]); // numbers: number[], $state([1, 2, 3]): number[]
	const total = $derived.by(() => { // total: number, $derived.by(() => { let total = 0; for (const n of numbers) { total += n; } return total; }): number
		let total = 0;
		for (const n of numbers) {
			total += n;
		}
		return total;
	});
</script>

<button on:click={() => numbers.push(numbers.length + 1)}> <!-- numbers.push(numbers.length + 1): number -->
	{numbers.join(' + ')} = {total} <!-- numbers.join(' + '): string, total: number -->
</button>
