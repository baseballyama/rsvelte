<script>
	let {
		class: klass = 'k',
		for: htmlFor,
		'data-x': dx = 'x',
		new: renamed,
		static: stat,
		...rest
	} = $props();
</script>

<label class={klass} for={htmlFor} data-x={dx}>{renamed}{stat}</label>
<p {...rest}>ok</p>
