<script>
	const obj = { a: 1 };
</script>
<div {...{ t: obj.a + /\}/.source }}></div>
