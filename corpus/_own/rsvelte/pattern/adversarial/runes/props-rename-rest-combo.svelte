<script>
	let {
		'aria-label': label,
		value: v = 'dv',
		children,
		...others
	} = $props();
	const spreadBack = { ...others, extra: v };
</script>

<button aria-label={label} {...spreadBack}>
	{@render children?.(v)}
</button>
