<script>
	const action = (node, parameters) => ({
        update: (parameters) => {},
        destroy: () => {}
    })
</script>

<div use:action/>
<div use:action={parameters}/>
