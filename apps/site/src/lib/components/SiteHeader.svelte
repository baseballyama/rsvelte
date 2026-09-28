<script lang="ts">
	import { page } from '$app/state';
	import { REPO_URL } from '$lib/site';
	import ThemeToggle from './ThemeToggle.svelte';

	const links = [
		{ href: '/learn', label: 'Learn' },
		{ href: '/learn/reference', label: 'リファレンス' },
		{ href: '/learn/playground', label: 'プレイグラウンド' }
	];
	const current = (href: string) =>
		href === '/learn'
			? page.url.pathname.startsWith('/learn') &&
				!links.slice(1).some((l) => page.url.pathname.startsWith(l.href))
			: page.url.pathname.startsWith(href);
</script>

<header class="sticky top-0 z-40 h-14 border-b border-line bg-bg">
	<div class="mx-auto flex h-full max-w-[1400px] items-center gap-4 px-4 whitespace-nowrap sm:gap-6 md:px-8 xl:px-12">
		<a href="/" class="shrink-0 font-mono text-[15px] font-medium tracking-normal">rsvelte</a>
		<nav class="flex min-w-0 items-center gap-4 overflow-x-auto text-[14px] [scrollbar-width:none] sm:gap-5" aria-label="サイト">
			{#each links as l (l.href)}
				<a
					href={l.href}
					class={['whitespace-nowrap', current(l.href) ? 'text-accent' : 'text-fg-2 hover:text-fg']}
					aria-current={current(l.href) ? 'page' : undefined}>{l.label}</a
				>
			{/each}
		</nav>
		<div class="ml-auto flex shrink-0 items-center gap-4 sm:gap-5">
			<span class="hidden font-mono text-[12px] tracking-normal text-muted sm:inline">experimental</span>
			<a href={REPO_URL} class="text-[14px] text-fg-2 hover:text-fg" rel="noopener">GitHub</a>
			<ThemeToggle />
		</div>
	</div>
</header>
