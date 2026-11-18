<script>
	let markup = $state('<em>raw</em>');
	let a = $state(1);
	let b = $state({ nested: true });
</script>

{@html markup}
{@html `<i>${a}</i>`}
{@html a > 0 ? markup : '<s>neg</s>'}

{@debug a, b}
{@debug}

<p>{a}:{b.nested}</p>
