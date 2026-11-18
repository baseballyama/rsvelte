<script>
	const big = 9_007_199_254_740_993n;
	const bin = 0b1010_1010;
	const oct = 0o777;
	const tiny = 1e-7;
	let title = $state('page');
</script>

<svelte:head>
	<title>{title} — site</title>
</svelte:head>

<p>{typeof big}:{bin}:{oct}:{tiny}</p>
<p>{1n} {typeof 1n}</p>
