<script>
	if (typeof window !== 'undefined') {
		window.scrollTo(0, 0);
	}
	const y = typeof window === 'undefined' ? 0 : window.scrollY;
	const z = typeof window === 'object' ? window.screenX : 0;
	void [y, z];
</script>
<p>typeof guards</p>
