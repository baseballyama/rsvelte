<script>
	let cnt = 0;
	$: {
		void cnt;
		await Promise.resolve();
		setTimeout(() => {}, 0);
		cnt = cnt + 1;
	}
</script>

{cnt}
