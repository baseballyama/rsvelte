<script>
	let html = $state('<b>x</b>');
	let text = $state('y');
	let inner = $state('z');
	let time = $state(0);
	let paused = $state(true);
	let duration = $state(0);
	let volume = $state(1);
	let rate = $state(1);
	let ended = $state(false);
	let ready = $state(0);
	let seeking = $state(false);
	let played = $state();
	let buffered = $state();
	let seekable = $state();
	let open = $state(false);
	let w = $state(0);
	let h = $state(0);
</script>

<div contenteditable="true" bind:innerHTML={html}></div>
<div contenteditable="true" bind:textContent={text}></div>
<div contenteditable="true" bind:innerText={inner}></div>

<video
	bind:currentTime={time}
	bind:paused
	bind:duration
	bind:volume
	bind:playbackRate={rate}
	bind:ended
	bind:readyState={ready}
	bind:seeking
	bind:played
	bind:buffered
	bind:seekable
	bind:clientWidth={w}
	bind:clientHeight={h}
>
	<track kind="captions" />
</video>

<details bind:open>
	<summary>s</summary>
	<p>{duration} {time} {volume} {rate} {ended} {ready} {seeking} {w}x{h}</p>
</details>
