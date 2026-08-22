<script>
	let el;
	const seen = new Map();
	const rows = [1, 2];

	function wire() {
		el.addEventListener('click', () => {
			seen.set(1, 2);
			el.innerHTML = '';
		});
		el['rem' + 'ove']();
	}
</script>

<div bind:this={el}>a</div>
<button onclick={wire}>wire</button>

{#each rows as el}
	<button onclick={() => el.addEventListener('x', () => el.remove())}>{el}</button>
{/each}
