<script>
	import data from './data.json' with { type: 'json' };

	let using = 1;
	const holder = { using: 2, source: 3, defer: 4 };
	const total = using + holder.using + holder.source + holder.defer;
</script>

<b>{data ? total : 0}</b>
