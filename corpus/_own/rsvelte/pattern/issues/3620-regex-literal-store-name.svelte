<script>
	export let mystore;
	const re = /\$mystore/;
	const inClass = /[/]\$mystore/;
	const escaped = /a\/b\$mystore/;
	const afterDivision = 6 / 2 / /\$mystore/.source.length;
	let count = 0;
</script>

<b>{mystore}{count}{re.source}{inClass.source}{escaped.source}{afterDivision}</b>
