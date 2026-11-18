<script>
  let v = $state("<b>&amp;</b>");
</script>

<pre>  leading and   inner   spaces
	tabbed line
</pre>
<textarea readonly>{v}</textarea>
<textarea readonly value={v}></textarea>
<code>&lt;div&gt;&amp;&#123;{v}&#125;</code>
<p>a&nbsp;b&#160;c&#x00A0;d</p>
<p>{"&amp; is not decoded in an expression"}</p>
