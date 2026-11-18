<script>
	let 数 = 0;
	$: Promise.resolve('🎉🎉').then(() => { 数 = 数 + 1; });
</script>

{数}
