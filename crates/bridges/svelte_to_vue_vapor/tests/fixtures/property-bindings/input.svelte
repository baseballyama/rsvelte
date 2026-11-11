<script>
  let checked = $state(false);
  let indeterminate = $state(true);
  let opened = $state(false);
  let input = $state();
  let observed = $state('');
  let focused = $state(false);
  let width = $state();
  let height = $state();
  let files = $state();
  function focus() { document.querySelector('input.focus').focus(); }
</script>
<input type="checkbox" bind:checked bind:indeterminate bind:this={input} />
<details bind:open={opened}><summary>toggle</summary><p>contents</p></details>
<input class="focus" bind:focused />
<img src="image.png" bind:naturalWidth={width} bind:naturalHeight={height} />
<input type="file" bind:files />
<button onclick={() => { opened = !opened; indeterminate = !indeterminate; }}>change</button>
<button class="read" onclick={() => observed = `${input.checked}:${input.indeterminate}`}>read</button>
<button class="focus" onclick={focus}>focus</button>
<p>{checked}:{indeterminate}:{opened}:{focused}:{width}:{height}:{files == null}:{observed}</p>
