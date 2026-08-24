<script>
	const obj = { a: 1, x: 2 };
	const variable = 1;
	const constant = 2;
	const letter = 3;
	const enumerate = 4;
	const typed = 5;
	const interfaces = 6;
	const var_x = 7;
	const let$x = 8;
	const const$x = 9;
	const type$x = 10;
	const type = 11;
</script>

<!-- The rejected half — `{var}`, `{var.x}`, `{var(1)}`, `{var$x}` — cannot live
     in a corpus file, because a corpus entry has to compile on both sides.
     `declaration_tag_keyword_3692.rs` carries those. What belongs here is the
     other side of the same boundary: every word that must NOT reach the
     declaration reader, which is the direction a `\b` rule can over-reach in. -->

<!-- an identifier that merely STARTS with a keyword is an expression -->
<p>{variable} {constant} {letter} {enumerate} {typed} {interfaces}</p>

<!-- `_` is in the regex word class, so `\b` does not match after `var` -->
<p>{var_x}</p>

<!-- `$` is NOT in it, but the supported and `type` regexes are confirmed by a
     parse that reads these as one identifier, so only the unsupported keywords
     are affected — which is what makes the upstream defect asymmetric -->
<p>{let$x} {const$x} {type$x}</p>

<!-- the quiet row: both compilers accept this, and it means an assignment to
     `let$x` rather than a declaration of `$x`, so only the emitted code differs -->
{let$x = 12}

<!-- `type` is a contextual keyword: a bare one, and every shape that is not
     `type <ident> = …`, stays an expression tag -->
<p>{type} {type === 11} {typeof obj}</p>

<!-- the supported declarations still open a declaration tag -->
{#if true}
	{const doubled = obj.a * 2}
	<span>{doubled}</span>
{/if}

{#each [1, 2] as n}
	{let scaled = n * obj.x}
	<span>{scaled}</span>
{/each}
