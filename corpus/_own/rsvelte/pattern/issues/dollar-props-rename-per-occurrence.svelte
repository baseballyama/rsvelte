<script>
	// The token below must survive: upstream renames identifiers, and a comment
	// holds none. $$props
	export let a = 1;
	export let count = 0;

	/* $$props in a block comment */
	const label = '$$props in a string';
	const tpl = `$$props in template text`;

	// A generated read-only-prop reference and a source read on one statement:
	// the line rule protected both and lost the second.
	export let b = count + $$props.z;
	const c = $$props.y;
</script>

<div {...$$restProps}>{a}{b}{c}{label}{tpl}</div>
