<script>
	let { a = 1, v = $bindable(0), ...rest } = $props(); void a; void v; void rest;
</script>

<b>{a}{v}{rest.x}</b>
