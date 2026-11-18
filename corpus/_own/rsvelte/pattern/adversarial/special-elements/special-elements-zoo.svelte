<svelte:options runes={true} namespace="html" />

<script>
	let w = $state(0);
	let scrollY = $state(0);
	let visible = $state(true);
	let title = $state('t');
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="x" content={title} />
</svelte:head>

<svelte:window bind:innerWidth={w} bind:scrollY onresize={() => w++} />
<svelte:document onvisibilitychange={() => (visible = !visible)} />
<svelte:body onmouseenter={() => (title = 'in')} onmouseleave={() => (title = 'out')} />

<p>{w}{scrollY}{visible}</p>
