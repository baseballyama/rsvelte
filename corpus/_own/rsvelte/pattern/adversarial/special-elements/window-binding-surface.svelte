<script>
	let innerWidth = $state(0);
	let innerHeight = $state(0);
	let outerWidth = $state(0);
	let outerHeight = $state(0);
	let scrollX = $state(0);
	let scrollY = $state(0);
	let online = $state(true);
	let devicePixelRatio = $state(1);
	let visible = $state('visible');
	let scrolled = $state(0);
	let activeEl = $state(null);
	let bodyEl = $state(null);

	function log(event) {
		scrolled += event.type.length;
	}
</script>

<svelte:window
	bind:innerWidth
	bind:innerHeight
	bind:outerWidth
	bind:outerHeight
	bind:scrollX
	bind:scrollY
	bind:online
	bind:devicePixelRatio
	onresize={log}
	onkeydown={(e) => log(e)}
	on:hashchange={log}
/>

<svelte:document bind:visibilityState={visible} bind:activeElement={activeEl} onvisibilitychange={log} />

<svelte:body bind:this={bodyEl} onmouseenter={log} onmouseleave={() => (scrolled = 0)} use:noop />

<p>{innerWidth}x{innerHeight} / {outerWidth}x{outerHeight} @ {devicePixelRatio}</p>
<p>{scrollX},{scrollY} {online} {visible} {scrolled} {activeEl?.tagName ?? '-'} {bodyEl?.nodeName ?? '-'}</p>

<script module>
	export function noop() {
		return { destroy() {} };
	}
</script>
