<script lang="ts">
	import { page } from '$app/state';
	import { REPO_URL } from '$lib/site';
	import Icon from './Icon.svelte';
	import { search } from './search.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	const links = [
		{ href: '/why', label: 'なぜrsvelteか' },
		{ href: '/learn', label: 'Learn' },
		{ href: '/learn/reference', label: 'リファレンス' },
		{ href: '/learn/playground', label: 'プレイグラウンド' }
	];
	const current = (href: string) =>
		href === '/learn'
			? page.url.pathname.startsWith('/learn') &&
				!links.some((l) => l.href !== '/learn' && page.url.pathname.startsWith(l.href))
			: page.url.pathname.startsWith(href);

	let mac = $state(true);
	$effect(() => {
		mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
	});
</script>

<header
	class="sticky top-0 z-40 h-14 border-b border-line bg-[var(--header-bg)] backdrop-blur-md backdrop-saturate-150"
>
	<div class="mx-auto flex h-full max-w-[1440px] items-center gap-3 px-4 whitespace-nowrap sm:gap-6 md:px-8">
		<a href="/" class="flex shrink-0 items-center gap-2" aria-label="rsvelte ホーム">
			<svg viewBox="0 0 32 32" class="size-[22px]" aria-hidden="true">
				<rect width="32" height="32" rx="7" class="fill-fg" />
				<path
					d="M9 22V10h7a4 4 0 0 1 0 8h-3l6 4"
					fill="none"
					class="stroke-accent"
					stroke-width="2.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<span class="font-mono text-[15px] font-medium tracking-normal">rsvelte</span>
		</a>
		<nav class="no-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto text-[14px]" aria-label="サイト">
			{#each links as l (l.href)}
				<a
					href={l.href}
					class={[
						'rounded-md px-2.5 py-1.5 whitespace-nowrap',
						current(l.href) ? 'bg-surface font-medium text-fg' : 'text-fg-2 hover:bg-surface hover:text-fg',
						!['/learn', '/why'].includes(l.href) && 'max-sm:hidden'
					]}
					aria-current={current(l.href) ? 'page' : undefined}
				>
					{l.label}
				</a>
			{/each}
		</nav>
		<div class="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
			<button
				type="button"
				class="flex h-8 items-center gap-2 rounded-md border border-line bg-raised pr-1.5 pl-2.5 text-[13px] text-muted hover:border-line-strong hover:text-fg max-sm:size-8 max-sm:justify-center max-sm:p-0 md:w-56"
				onclick={() => (search.open = true)}
				aria-label="検索"
				aria-keyshortcuts="Meta+K Control+K /"
			>
				<Icon name="search" size={15} />
				<span class="hidden md:inline">教材を検索…</span>
				<span class="ml-auto hidden items-center gap-0.5 sm:flex"
					><span class="kbd">{mac ? '⌘' : 'Ctrl'}</span><span class="kbd">K</span></span
				>
			</button>
			<span
				class="hidden rounded-full border border-line px-2 py-0.5 font-mono text-[11px] tracking-normal text-muted lg:inline"
				title="実験的な実装です">experimental</span
			>
			<a
				href={REPO_URL}
				class="flex size-8 items-center justify-center rounded-md text-fg-2 hover:bg-surface hover:text-fg"
				rel="noopener"
				aria-label="GitHub リポジトリ"><Icon name="github" size={18} /></a
			>
			<ThemeToggle />
		</div>
	</div>
</header>
