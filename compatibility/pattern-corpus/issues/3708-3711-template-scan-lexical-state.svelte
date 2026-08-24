<script>
	const obj = { a: 1 };
	const list = [1];
</script>

<!-- Where a template expression ENDS, against the lexical states a `}` or a
     newline can hide in. Every row is a document the official compiler accepts
     and rsvelte rejected, so none of them could be a corpus entry before the
     fix — which is how the class survived: an over-rejection has no output to
     diverge on. -->

<!-- A regex is never the FIRST token of an expression tag: `{/` opens a block
     closing tag, and official rejects `{/}/.source}` too. So the regex rows put
     something in front of it, which is also the shape a real file has. -->
<p>{String(/}/).length}</p>
<p>{obj.a + /}/.source.length}</p>
<p>{obj.a + /[}]/.source.length}</p>
<p>{obj.a + /\}/.source.length}</p>

<!-- the same `}` inside each string form -->
<p>{"}"}</p>
<p>{'}'}</p>
<p>{`}`}</p>
<p>{`${"}"}`}</p>

<!-- a spread attribute's object: the scan that found its closing `}` was a bare
     depth counter with no lexical state at all -->
<div {...{ t: /}/.source }}></div>
<div {...{ t: '}' }}></div>
<div {...{ t: `a ${obj.a} }` }}></div>

<!-- the `{#each}` collection, its key, and the `{#await}` head each reach their
     own scan; those handled strings and had no regex arm -->
{#each [/}/.source] as n}
	<span>{n}</span>
{/each}

{#each list as n (/}/.source)}
	<span>{n}</span>
{/each}

{#await Promise.resolve(/}/.source)}
	<span>pending</span>
{:then v}
	<span>{v}</span>
{/await}

<!-- The `{#await}` head had no comment arm either, and that row is deliberately
     NOT here: it now compiles, but its output loses the comment (#3603), and in
     this file the two sides agree only because an earlier row has already
     parked esrap's comment cursor. A row that passes because of its neighbours
     is worse than an absent one. It lives in the Rust test, which asserts the
     over-rejection is gone without asserting byte parity. -->

<!-- a LINE CONTINUATION: the backslash escapes the newline, so the string runs
     on and the "a quote closes at end of line" bound is wrong -->
<p>{'a\
b'.length}</p>
<p>{"a\
b".length}</p>
<div title={'a\
b'}></div>
{#if 'a\
b'.length}
	<span>continued</span>
{/if}
{@html 'a\
b'}
{#if true}
	{@const c = 'a\
b'}
	<span>{c}</span>
{/if}

<!-- the controls a regex-aware scan is most likely to break: a `/` that is
     division, one after a postfix update, the two escape shapes that decide
     where a string ends, and the template literal that was already right —
     which is what names the real newline, not the backslash, as the cause -->
<p>{obj.a / 2}</p>
<p>{(() => { let z = 1; z++; return z / 2; })()}</p>
<p>{'a\'b'.length}</p>
<p>{'\\'.length}</p>
<p>{`a\
b`.length}</p>
<div {obj}></div>
