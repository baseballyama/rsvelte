<script>
  let text = $state("hi");
</script>

<pre>
  a
	{text}
</pre>
<pre>

two newlines</pre>
<pre><code>  {text}  </code></pre>
<button type="button" onclick={() => (text += "!")}>more</button>
