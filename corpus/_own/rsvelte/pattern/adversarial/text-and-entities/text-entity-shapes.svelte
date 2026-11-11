<script>
	let v = $state('x');
</script>

<p>&amp;&lt;&gt;&quot;&#39;&#x2764;&nbsp;&hellip;</p>
<p>&#123;not a tag&#125;</p>
<p>a{v}b</p>
<p>{v}{v}</p>
<p>
	multi
	line
	text
</p>
<p>trailing space </p>
<p>	tab-led</p>
<p>{' '}{' '}</p>
<p>{`back\`tick`}</p>
<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>
<p>{"</p>"}</p>
<button onclick={() => (v += '!')}>{v}</button>
