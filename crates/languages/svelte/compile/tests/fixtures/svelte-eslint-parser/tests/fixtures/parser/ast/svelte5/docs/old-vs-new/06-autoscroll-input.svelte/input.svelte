<script>
	import { tick } from 'svelte';

	let theme = $state('dark');
	let messages = $state([]);

	let div;

	$effect.pre(() => {
		messages;
		const autoscroll = div && div.offsetHeight + div.scrollTop > div.scrollHeight - 50;

		if (autoscroll) {
			tick().then(() => {
				div.scrollTo(0, div.scrollHeight);
			});
		}

	});

	function handleKeydown(event) {
		if (event.key === 'Enter') {
			const text = event.target.value;
			if (!text) return;

			messages = [...messages, text];
			event.target.value = '';
		}
	}

	function toggle() {
		toggleValue = !toggleValue;
	}
</script>

<div class:dark={theme === 'dark'}>
	<div bind:this={viewport}>
		{#each messages as message}
			<p>{message}</p>
		{/each}
	</div>

	<input on:keydown={handleKeydown} />

	<button on:click={toggle}>
		Toggle dark mode
	</button>
</div>
