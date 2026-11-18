<script>
	let {
		a,
		// before b
		b = 1,
		c = 2, // after c
		/* before d */ d,
		...rest
		// before the closing brace
	} = $props();
</script>

<p>{a}{b}{c}{d}</p>
<div {...rest}></div>
