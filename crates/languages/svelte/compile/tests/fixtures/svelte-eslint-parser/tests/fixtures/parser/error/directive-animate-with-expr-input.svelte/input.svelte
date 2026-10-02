<script>
	import { flip } from 'svelte/animate';
	const foo = { flip }
	let list = [1,2,3,4,5,6,7,8,9,10]
	function shuffle() {
		let currentIndex = list.length;
		while (currentIndex != 0) {
			const randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;
			[list[currentIndex], list[randomIndex]] = [
				list[randomIndex], list[currentIndex]];
		}
	}
</script>
<button on:click={shuffle}>Shuffle</button>
{#each list as item, index (item)}
	<li animate:foo.flip>{item}</li>
{/each}

<!-- Treat it as a compile error, as it will be a run-time error. -->

<!-- https://svelte.dev/repl/d761c6514ec94909b76524585d72ed88?version=3.52.0 -->
