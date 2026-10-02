<script>
	import Header from '$lib/Header.svelte';
	import '../app.css';
	if (typeof window !== 'undefined') {
		window.process = {
			cwd: () => '/'
		};
	}
</script>

<Header />

<main class="main">
	<slot />
</main>

<style>
	.main {
		position: relative;
		height: calc(100vh - 64px);
	}
	.main > :global(*) {
		position: relative;
		width: 100%;
		height: 100%;
	}
</style>
