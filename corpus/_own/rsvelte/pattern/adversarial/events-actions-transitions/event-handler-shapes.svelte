<script>
	let n = $state(0);
	const handlers = { click: () => n++ };
	const maybe = $derived(n > 2 ? handlers.click : null);
</script>

<button onclick={handlers.click}>a</button>
<button onclick={maybe}>b</button>
<button onclick={() => { n++; }}>c</button>
<button onclick={function named(e) { n += e.detail ?? 1; }}>d</button>
<button onclick={async (e) => { await Promise.resolve(); n++; }}>e</button>
<button onclick={n > 0 ? handlers.click : undefined}>f</button>
<button onclick={handlers['click']}>g</button>
<button {...{ onclick: handlers.click }}>h</button>
<svelte:window onresize={() => n++} onkeydown={maybe} />
<p>{n}</p>
