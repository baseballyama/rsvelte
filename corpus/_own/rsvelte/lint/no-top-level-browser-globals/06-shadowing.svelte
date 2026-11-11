<script>
	const document = { title: 'shadowed' };
	document.title = 'fine';
	function useParam(window) {
		return window.innerWidth;
	}
	let { navigator: nav } = $props();
	void [useParam, nav];
</script>
<p>shadowing</p>
