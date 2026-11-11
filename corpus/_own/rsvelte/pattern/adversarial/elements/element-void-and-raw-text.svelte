<script>
	let v = $state('x');
</script>

<br />
<br>
<hr/>
<img src="a.png" alt="a">
<input value={v}>
<area shape="rect" />
<wbr>
<col span="1" />

<textarea>{v}</textarea>
<textarea value={v}></textarea>
<textarea>
	leading newline is stripped
</textarea>
<pre>  spaced  </pre>
<pre>
first line after the tag
</pre>
<title>{v}</title>
<template><p>inert {v}</p></template>
<noscript><p>no js</p></noscript>
<button onclick={() => (v += '!')}>{v}</button>
