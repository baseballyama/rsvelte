<script>
	const obj = { a: 1 };
	const list = [1];
</script>

<!-- The rejected half of this defect cannot live in a corpus file: a corpus
     entry has to compile on both sides, and every unparseable initializer is a
     `js_parse_error` in both compilers now. `const_tag_parse_error_3691.rs`
     carries those; what belongs here are the shapes that must keep COMPILING,
     because propagating the error is exactly the change that could break them. -->

{#if true}
	{@const simple = 1 + 2}
	<span>{simple}</span>
{/if}

<!-- a parenthesized sequence is legal; only a bare one is the `{@const}` error -->
{#if true}
	{@const paren_seq = (1, 2)}
	<span>{paren_seq}</span>
{/if}

<!-- destructuring goes through `parse_destructuring_pattern`, a different
     reader that keeps its own fallback -->
{#if true}
	{@const { a } = obj}
	<span>{a}</span>
{/if}

{#if true}
	{@const [first] = list}
	<span>{first}</span>
{/if}

<!-- the `{#each}` host reaches the same reader by a different route, and is
     where a `{@const}` most often sits -->
{#each list as n}
	{@const doubled = n * 2}
	<span>{doubled}</span>
{/each}

<!-- a TypeScript-style annotation on the pattern is stripped before the parse,
     so the pattern reader must still see a bare identifier -->
{#if true}
	{@const typed = obj.a}
	<span>{typed}</span>
{/if}

<!-- the initializer may itself contain braces, comments and a regex whose `}`
     must not terminate the tag — the slice this reader parses is found by the
     lexical bracket scan, and propagating its parse error does not change that -->
{#if true}
	{@const re = /}/}
	<span>{re.source}</span>
{/if}

{#if true}
	{@const nested = { b: { c: 1 } }.b.c}
	<span>{nested}</span>
{/if}
