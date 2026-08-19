<script>
	let rest = { name: 'header' };
	let d = 'x';
</script>

<slot {...rest} />
<slot {...rest} name={d} />
