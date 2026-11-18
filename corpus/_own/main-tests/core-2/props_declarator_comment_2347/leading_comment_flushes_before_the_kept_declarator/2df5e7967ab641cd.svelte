<script>
	let {
		// eslint-disable-next-line
		class: className,
		...props
	} = $props();
</script>

<div class={className} {...props}></div>
