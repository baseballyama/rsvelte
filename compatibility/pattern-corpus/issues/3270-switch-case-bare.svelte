<script>
	let kind = $state('a');
	let out = 0;
	switch (kind) {
		case 'a':
			let r = $state(7);
			out = r;
			break;
		default:
			out = -1;
	}
</script>

<p>{out}</p>
