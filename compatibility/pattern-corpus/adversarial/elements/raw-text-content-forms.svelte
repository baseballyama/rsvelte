<script>
	let value = $state('a\nb');
	const html = '<b>x</b>';
</script>

<textarea>{value}</textarea>
<textarea bind:value></textarea>
<textarea value={value}></textarea>
<textarea>  leading and trailing  </textarea>
<textarea>{'<'}not a tag{'>'}</textarea>

<title>{value} — {html.length}</title>

<pre>{value}
	indented
</pre>

<style>
	textarea {
		display: block;
	}
</style>
