<script>
	let n = $state(1);
	const re = /\{[^}]*\}/g;
	const tpl = (x) => `a${`b${x}`}c`;
</script>

<p>{'}'}</p>
<p>{"{"}</p>
<p>{`${'}'}${'{'}`}</p>
<p>{tpl(n)}</p>
<p>{re.source}</p>
<p>{/* comment with } and { */ n}</p>
<p>{(() => { return n; })()}</p>
<p>{ { a: 1 }.a }</p>
<p>{[{ b: 2 }][0].b}</p>
<p>{n > 0 ? `${'{'}` : '}'}</p>
<p>&lbrace;literal&rbrace;</p>
