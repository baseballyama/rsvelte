<script>
	import { fade } from 'svelte/transition';

	let show = $state(true);
	let log = $state([]);

	const note = (m) => () => (log = [...log, m]);
</script>

<div onclickcapture={note('cap')} onclick={note('bub')} role="presentation">
	<button onfocusin={note('in')} onfocusout={note('out')}>focus</button>
</div>

{#if show}
	<p
		transition:fade
		onintrostart={note('is')}
		onintroend={note('ie')}
		onoutrostart={note('os')}
		onoutroend={note('oe')}
	>
		animated
	</p>
{/if}

<button onclick={() => (show = !show)}>{log.length}</button>
