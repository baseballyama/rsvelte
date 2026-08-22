<script>
	let x = 'a';
	let cond = true;
</script>

<slot name={`h${x}`} />
<slot name={cond ? 'a' : 'b'} />
<slot name={'a' + 'b'} />
