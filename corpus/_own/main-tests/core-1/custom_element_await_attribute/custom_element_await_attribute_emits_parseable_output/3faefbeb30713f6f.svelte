<script>
	const foo = $derived(await 'foo');
</script>

<async-custom-element {foo} bar={await 'bar'}></async-custom-element>