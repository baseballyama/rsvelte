<script>
	let obj = $state({});
	let { "a\nb": v, "c\\d": w, ...r } = $derived(obj);
</script>
<p>{v}{w}{r}</p>