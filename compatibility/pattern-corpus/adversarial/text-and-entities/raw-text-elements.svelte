<script>
	let value = $state('a < b && c > d');
	const title = 'T & T';
</script>

<textarea bind:value>&lt;preset&gt; &amp; more</textarea>
<textarea readonly>{value}</textarea>
<title>{title}</title>
<pre>  keeps   spacing
	and tabs &amp; entities</pre>
<code>{'<script>'}</code>
<p>{@html '<b>raw &amp; bold</b>'}</p>
<div>&lt;div&gt; &nbsp;&nbsp; &#x26; &#38; &copy;&trade;</div>
<span title="a &quot;quoted&quot; &amp; escaped">attr entities</span>
