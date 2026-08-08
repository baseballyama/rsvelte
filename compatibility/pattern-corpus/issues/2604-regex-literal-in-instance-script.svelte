<script>
	export let src;
	export let a;
	export let b;
	export let total;

	$: isUrl = typeof src === 'string' && /^(https?:)?\/\//i.test(src);
	$: label =
		a?.replace(/^https?:\/\//, '') ||
		b;
	$: half = total / 2;
</script>

<p>{isUrl}{label}{half}</p>
