<script>
	let bs = $state('\\');
	let quote = $state('\\\'');
	let tpl = $state(`tail\\`);
	const re = /\\\//g;
	const re2 = /[/\\]'"`/;
	const wins = $derived(bs.replace(re, '/').replace(re2, ''));
</script>

<p>{wins}{quote}{tpl}</p>
