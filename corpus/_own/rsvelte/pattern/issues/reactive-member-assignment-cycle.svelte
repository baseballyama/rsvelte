<script>
	export let data = { size: 0, count: 0, encrypt: false };
	let size = data.size;

	$: data.size = size;
	$: if (data.encrypt && size < 150) size = 150;
	$: data.count++;
</script>

<p>{size}</p>
