<script>
	let {
		class: klass = '',
		for: htmlFor,
		new: isNew = false,
		'data-x': dataX,
		typeof: kind,
		...rest
	} = $props();
</script>

<label for={htmlFor} class={klass} data-x={dataX} {...rest}>
	{isNew ? 'new' : 'old'}:{kind}
</label>
