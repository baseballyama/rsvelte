<script module>
	// svelte-ignore module-script-reactive-declaration
	let m = 0;
	$: m = 1;
	void m;
</script>

<script>
	export let title;
</script>
<!-- svelte-ignore avoid-is -->
<p>{title}</p>
