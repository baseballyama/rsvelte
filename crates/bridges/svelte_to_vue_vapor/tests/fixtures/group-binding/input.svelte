<script>
  let selected = $state(['a']);
  let radio = $state('x');
  const values = ['a', 'b', 'c'];
</script>
<input type="checkbox" value="a" bind:group={selected} />
<input type="checkbox" value="b" bind:group={selected} />
<input type="checkbox" value="c" bind:group={selected} />
<input type="radio" value="x" bind:group={radio} />
<input type="radio" value="y" bind:group={radio} />
<button onclick={() => { selected = ['c']; radio = 'y'; }}>replace</button>
<p>{selected.join(',')}:{radio}</p>
