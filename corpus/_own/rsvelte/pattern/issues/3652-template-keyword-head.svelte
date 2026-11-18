<script>
	const obj = { url: 1, x: 2, class: 3 };
	// The script path always went through the real parser, and is the control
	// that names the template fast path as the site.
	const from_script = import.meta.url;
</script>

<!-- a member access on `import.meta` is dynamic, and needs component context -->
<p>{import.meta.url}</p>
<p>{import.meta.env.MODE}</p>
<p>{true ? import.meta.url : ''}</p>
<div title={import.meta.url}></div>
{#if import.meta.url}<span>y</span>{/if}
{#if true}{@const c = import.meta.url}<span>{c}</span>{/if}

<!-- `import.meta` on its own is not a member expression, so it stays static —
     the row that hid the defect, because the old parse agreed here -->
<p>{import.meta}</p>

<!-- the two node types the real parser produces and the client's reactivity
     walk had never seen: an unknown node counted as reactive, so handing these
     to the real parser is what made them observable -->
<p>{import('./x')}</p>

<!-- `this` is the same shape one node type over: an `Identifier` named `this`
     has an unbound-global base and reads as static, a `ThisExpression` does not -->
<p>{this.x}</p>

<!-- controls: ordinary chains in the same slots must not become dynamic, and a
     keyword is legal as a PROPERTY name — `props.class` is ordinary Svelte -->
<p>{obj.url}</p>
<p>{obj.class}</p>
<p>{undefined}</p>
<p>{from_script}</p>
