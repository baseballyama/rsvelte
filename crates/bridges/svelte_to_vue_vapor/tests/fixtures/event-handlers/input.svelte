<script>
  let count = $state(0);
  let value = $state('first');
  let observed = $state('');
  let handler = $state.raw(null);
  function pressed() { this.setAttribute('data-pressed', String(++count)); }
</script>
<div onclickcapture={() => count++}><button onclick={pressed}>click</button></div>
<input oninput={() => observed = value} bind:value={value} />
<p>{count}:{observed}</p>
<button class="toggle" onclick={() => handler = handler ? null : pressed}>toggle handler</button>
<button class="dynamic" onclick={handler}>dynamic</button>
