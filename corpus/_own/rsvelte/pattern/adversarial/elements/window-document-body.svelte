<script>
	let y = $state(0);
	let w = $state(0);
	let online = $state(true);
	function noop() {}
</script>

<svelte:window bind:scrollY={y} bind:innerWidth={w} bind:online on:resize={noop} />
<svelte:document on:visibilitychange={noop} />
<svelte:body on:mouseenter={noop} on:mouseleave={noop} />
<p>{y} {w} {online}</p>
