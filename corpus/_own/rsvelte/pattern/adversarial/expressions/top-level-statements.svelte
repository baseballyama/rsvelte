<script>
	let log = $state([]);

	try {
		JSON.parse('{');
	} catch {
		log.push('caught');
	} finally {
		log.push('finally');
	}

	switch (log.length) {
		case 2: {
			log.push('two');
			break;
		}
		default:
			break;
	}

	do {
		log.push('once');
	} while (false);

	for (const [i, v] of log.entries()) {
		if (i > 10) continue;
		void v;
	}

	label: {
		if (log.length > 3) break label;
		log.push('unlabelled');
	}
</script>

<p>{log.join(',')}</p>
