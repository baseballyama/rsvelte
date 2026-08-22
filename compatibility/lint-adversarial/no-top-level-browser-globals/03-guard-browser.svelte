<script>
	import { browser } from '$app/environment';
	if (browser) {
		document.title = 'guarded';
	}
	const t = browser ? window.innerWidth : 0;
	const bad = navigator.userAgent;
	void [t, bad];
</script>
<p>app environment guard</p>
