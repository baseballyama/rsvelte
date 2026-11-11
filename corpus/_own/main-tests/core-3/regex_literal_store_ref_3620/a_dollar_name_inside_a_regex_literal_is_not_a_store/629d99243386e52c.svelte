<script>
	export let mystore;
	const s = `${/\$mystore/.source}`;
</script>
<b>{mystore}{s}</b>
