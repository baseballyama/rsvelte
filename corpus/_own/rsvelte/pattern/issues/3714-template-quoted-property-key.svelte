<script>
	const align = 'center';

	function cn(...parts) {
		return parts.join(' ');
	}
</script>

<!-- esrap prints a literal from its `raw`, so the source's quote spelling is
     part of the output. A double-quoted object property KEY inside a template
     expression lost it and came out single-quoted: the code parses and computes
     the same value, so only byte equality can see the difference — and the
     corpus gate normalizes with oxfmt, which rewrites quotes. -->
<div class={cn({ "items-center": align === "center" })}></div>
<div class={cn({ "a-b": 1, "c-d": 2 })}></div>
<div class={cn({ x: { "nested-key": 1 } })}></div>
<div class={cn({ "1": 1 })}></div>
<div class={cn({ "plainident": 1 })}></div>
<p>{JSON.stringify({ "a-b": 1 })}</p>
{#each [{ "a-b": 1 }] as item}
	<span>{item["a-b"]}</span>
{/each}

<!-- The controls, in the directions a fix to the key's `raw` could break. A
     single-quoted key was already right, so it is what says the defect is the
     dropped `raw` and not the key position; a double-quoted VALUE and a computed
     key were already right too, and they are where the same `raw` is read by a
     different converter. -->
<div class={cn({ 'single-key': 1 })}></div>
<div class={cn({ a: "double-value" })}></div>
<div class={cn({ ["computed-key"]: 1 })}></div>
<div class={cn({ 'a\'b': 1 })}></div>
<div class={cn({ "a\"b": 1 })}></div>
