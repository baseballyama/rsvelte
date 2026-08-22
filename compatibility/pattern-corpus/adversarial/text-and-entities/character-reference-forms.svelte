<script>
  let n = $state(1);
</script>

<p>named: &amp; &lt; &gt; &quot; &apos; &nbsp; &copy; &hellip; &mdash;</p>
<p>decimal: &#65; &#x41; &#8212; &#x2014;</p>
<p>astral: &#128512; &#x1F600;</p>
<p>unterminated: &amp &lt &notanentity; &#; &#x;</p>
<p>bare ampersand: a & b &{n}</p>
<p>mixed: &amp;amp; &amp;#65;</p>
<div title="named &amp; &lt; &gt;">a</div>
<div title="decimal &#65; hex &#x41;">b</div>
<div data-value="unterminated &amp entity">c</div>
<div title="interpolated {n} &amp; more">d</div>
<a href="/a?b=1&amp;c=2">e</a>
<a href="/a?b=1&c=2">f</a>
