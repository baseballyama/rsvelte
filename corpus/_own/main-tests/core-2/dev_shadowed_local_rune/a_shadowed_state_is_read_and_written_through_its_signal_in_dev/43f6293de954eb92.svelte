<script>
	function createArray(initial) {
		let array = $state(initial);
		return {
			get value() {
				return array;
			},
			push(entry) {
				array.push(entry);
				array = array.slice();
			}
		};
	}

	const array = createArray(['x']);
</script>

{#each array.value as entry}
	<p>{entry}</p>
{/each}
