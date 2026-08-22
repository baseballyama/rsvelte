<script>
	let rest = {};
	let onclick = null;
	let aaa = 1;
	let C = null;
	let tag = "div";
</script>

<!-- shorthand `{name}` is a SvelteShorthandAttribute upstream, so the
     spread-between escape hatch does not apply to it -->
<img alt="a" src="b" {...rest} {onclick} />
<img alt="a" src="b" {...rest} onclick={onclick} />
<div zzz="1" {...rest} {aaa}>1</div>
<div zzz="1" {...rest} aaa="2">2</div>
<div zzz="1" {...rest} bbb="2" {aaa}>3</div>

<!-- `this=` is a SvelteSpecialDirective, not a SvelteAttribute -->
<svelte:component id="x" {...rest} this={C} />
<svelte:element id="x" {...rest} this={tag} />
