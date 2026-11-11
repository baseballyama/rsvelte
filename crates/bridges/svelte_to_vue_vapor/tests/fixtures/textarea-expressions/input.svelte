<script>
  let value = $state('\nfirst');
  let unrelated = $state(0);
</script>
<button onclick={() => value = value === 'first' ? 'second' : 'first'}>change</button>
<button onclick={() => unrelated++}>unrelated</button>
<button onclick={() => value = '\nleading'}>newline</button>
<textarea id="single">{value}</textarea>
<textarea id="mixed">prefix &amp; {value} suffix</textarea>
<textarea id="bound" bind:value={value}>{value}</textarea>
<textarea id="null">{null}</textarea>
<textarea id="newline">
{value}</textarea>
<textarea id="double-newline">

{value}</textarea>
<p>{value}:{unrelated}</p>
