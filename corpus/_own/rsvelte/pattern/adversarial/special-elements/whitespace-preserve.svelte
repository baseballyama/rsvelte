<svelte:options preserveWhitespace />

<script>
	let n = $state(0);
</script>

<p>   leading and trailing   </p>
<span>a</span>   <span>b</span>
<div>
	{n}
	{n}
</div>
<pre>	tabbed
  spaced
</pre>
<button onclick={() => n++}> {n} </button>
