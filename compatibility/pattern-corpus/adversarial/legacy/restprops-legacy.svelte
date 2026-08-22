<script>
	export let a = 1;
	const passthrough = $$restProps;
	$: klass = $$props.class ?? 'none';
</script>

<div {...$$restProps} data-a={a}>x</div>
<input {...passthrough} class={klass} />
