<script>
	import { BROWSER } from 'esm-env';
	if (BROWSER) {
		localStorage.setItem('k', 'v');
	}
	if (!import.meta.env.SSR) {
		sessionStorage.getItem('k');
	}
	history.back();
</script>
<p>esm-env and import.meta guards</p>
