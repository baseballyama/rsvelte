<script>
	let { open = $bindable(), w = $bindable() } = $props();
	let t = $state(0);
	let p = $state(true);
	let v = $state(1);
	let files = $state();
	let f = $state(false);
	let rect = $state();
	let h = $state(0);
	let html = $state('');
	let ind = $state(false);
	let d = $state(0);
	let text = $state('');
	let ty = $state('text');
	function act() {}
</script>
<video bind:currentTime={t} bind:paused={p} bind:volume={v} bind:duration={d} bind:videoWidth={w} bind:buffered={rect}></video>
<audio bind:muted={p} bind:playbackRate={v} bind:seeking={f} bind:ended={f} bind:readyState={h} bind:played={rect} bind:seekable={rect}></audio>
<details bind:open></details>
<details bind:open={p}></details>
<input type="file" bind:files />
<input type="file" bind:value={text} />
<input bind:focused={f} />
<div bind:clientWidth={w} bind:offsetHeight={h} bind:contentRect={rect}></div>
<div contenteditable bind:innerHTML={html}></div>
<p contenteditable="true" bind:textContent={text} bind:innerText={text}></p>
<input type="checkbox" bind:indeterminate={ind} bind:checked={f} />
<input type={ty} bind:value={text} />
<input type="checkbox" bind:value={text} />
<img bind:naturalWidth={w} alt="" />
<input bind:value={text} use:act />
<input bind:value={w} />
<input bind:value={() => text, (v) => (text = v)} />
<select bind:value={text} {...{}}><option>a</option></select>
