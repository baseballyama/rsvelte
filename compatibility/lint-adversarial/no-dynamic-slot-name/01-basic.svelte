<script>
	let dyn = 'a';
</script>

<slot name={dyn} />
<slot name="ok" />
<slot name="a{dyn}" />
<slot />
