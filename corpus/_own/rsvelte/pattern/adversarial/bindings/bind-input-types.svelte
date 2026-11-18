<script>
	let text = $state('');
	let num = $state(0);
	let checked = $state(false);
	let group = $state([]);
	let radio = $state('a');
	let files = $state(null);
	let sel = $state('a');
	let multi = $state([]);
	let dim = $state(0);
	let time = $state(0);
	let el = $state(null);
</script>

<input type="text" bind:value={text} />
<input type="number" bind:value={num} />
<input type="range" bind:value={num} />
<input type="checkbox" bind:checked />
<input type="checkbox" bind:group value="x" />
<input type="radio" bind:group={radio} value="a" />
<input type="file" bind:files />
<textarea bind:value={text}></textarea>
<select bind:value={sel}><option value="a">a</option></select>
<select multiple bind:value={multi}><option value="a">a</option></select>
<div bind:clientWidth={dim} bind:offsetHeight={dim}></div>
<video bind:currentTime={time} bind:duration={time} bind:paused={checked}><track kind="captions" /></video>
<details bind:open={checked}><summary>s</summary>b</details>
<div contenteditable="true" bind:innerHTML={text}></div>
<div bind:this={el}></div>
<p>{text}{num}{checked}</p>
<p>{group.length}{radio}</p>
<p>{files ? 1 : 0}{sel}</p>
<p>{multi.length}{dim}{time}</p>
<p>{el ? 1 : 0}</p>
