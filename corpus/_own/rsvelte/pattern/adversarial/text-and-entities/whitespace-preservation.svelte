<svelte:options preserveWhitespace />

<script>
  let v = $state("x");
</script>

<div>spaced {v} text</div>
<span>a</span> <span>b</span>
<pre>	tab
  two spaces
</pre>
<p>line one line two</p>
