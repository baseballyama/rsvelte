<script>
	let scrollY = $state(0);
	let innerWidth = $state(0);
	let online = $state(true);
	let fullscreenElement = $state(null);

	function onKey(e) {
		scrollY = e.key === 'ArrowDown' ? scrollY + 1 : scrollY;
	}
</script>

<svelte:window bind:scrollY bind:innerWidth bind:online onkeydown={onKey} />
<svelte:document bind:fullscreenElement onvisibilitychange={() => {}} />
<svelte:body onmouseenter={() => (online = true)} />

<svelte:head>
	<title>scroll {scrollY}</title>
	<meta name="width" content={String(innerWidth)} />
</svelte:head>

<p>{online}:{fullscreenElement ? 'fs' : 'no'}</p>
