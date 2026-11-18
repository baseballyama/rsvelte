<script>
	let currentTime = $state(0);
	let paused = $state(true);
	let volume = $state(1);
	let duration = $state(0);
	let w = $state(0);
	let h = $state(0);
	let box = $state(null);
</script>

<video src="/v.mp4" bind:currentTime bind:paused bind:volume bind:duration bind:playbackRate={volume}>
	<track kind="captions" />
</video>

<div bind:clientWidth={w} bind:offsetHeight={h} bind:contentRect={box}>
	{w}x{h}:{box?.width}
</div>
