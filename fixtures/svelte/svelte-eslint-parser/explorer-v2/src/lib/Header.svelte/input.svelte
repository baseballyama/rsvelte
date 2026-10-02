<script>
	import SnsBar from './SnsBar.svelte';
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';

	function isActive(pathname, path) {
		const normalizedPathname = pathname.replace(/\/$/u, '');
		const normalizedPath = path.replace(/\/$/u, '');
		return (
			normalizedPathname === normalizedPath || normalizedPathname === resolve(normalizedPath || '/')
		);
	}
</script>

<header class="header">
	<span class="title">svelte-eslint-parser</span>
	<a class="menu" class:active={isActive($page.url.pathname, `/`)} href={resolve('/')}>AST</a>
	<a
		class="menu"
		class:active={isActive($page.url.pathname, `/playground`)}
		href={resolve('/playground')}>Playgroud</a
	>
	<a class="menu" class:active={isActive($page.url.pathname, `/scope`)} href={resolve('/scope')}
		>Scope</a
	>
	<a
		class="menu"
		class:active={isActive($page.url.pathname, `/virtual-script-code`)}
		href={resolve('/virtual-script-code')}>Virtual Script Code</a
	>
	<div class="debug">
		$page.url.pathname: {$page.url.pathname}
	</div>
	<SnsBar />
	<a href="https://github.com/sveltejs/svelte-eslint-parser" class="github-link">View on GitHub</a>
</header>

<style>
	.header {
		height: 32px;
		display: flex;
		border-bottom: 1px #ddd solid;
	}
	.title {
		font-size: 120%;
		display: flex;
		align-items: center;
		padding-right: 16px;
	}
	.menu {
		padding: 4px 16px;
		border-radius: 4px 4px 0 0;
		border-color: #ddd #ddd transparent #ddd;
		border-style: solid;
		border-width: 1px;
	}
	.menu.active {
		margin-bottom: -2px;
		border-bottom: 2px solid #ff3e00;
	}
	.github-link {
		display: flex;
		align-items: center;
	}
	.debug {
		display: none;
	}
</style>
