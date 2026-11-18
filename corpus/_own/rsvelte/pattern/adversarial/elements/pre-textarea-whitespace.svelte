<script>
	let code = $state('const x = 1;');
</script>

<pre>
  first line
	tabbed {code}
    spaced
</pre>

<pre>{code}
</pre>

<textarea rows="3">
	default   content {code}
</textarea>

<textarea bind:value={code}></textarea>
