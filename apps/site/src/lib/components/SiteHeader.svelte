<script lang="ts">
	import { page } from '$app/state';
	import { bilingual, localizedPath, pathWithoutLang, switchHref, type Lang } from '$lib/i18n';
	import { readerLang } from '$lib/lang.svelte';
	import { REPO_URL } from '$lib/site';
	import Icon from './Icon.svelte';
	import { search } from './search.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	const text = bilingual(
		{
			links: [
				{ href: '/guide', label: '使い方' },
				{ href: '/why', label: 'なぜrsvelteか' },
				{ href: '/learn', label: '開発者向け' },
				{ href: '/learn/reference', label: 'リファレンス' },
				{ href: '/learn/playground', label: 'プレイグラウンド' }
			],
			home: 'rsvelte ホーム',
			site: 'サイト',
			search: '検索',
			searchPlaceholder: 'ガイド・教材を検索…',
			experimental: '実験的な実装です',
			repository: 'GitHub リポジトリ'
		},
		{
			links: [
				{ href: '/guide', label: 'Guide' },
				{ href: '/why', label: 'Why rsvelte' },
				{ href: '/learn', label: 'For developers' },
				{ href: '/learn/reference', label: 'Reference' },
				{ href: '/learn/playground', label: 'Playground' }
			],
			home: 'rsvelte home',
			site: 'Site',
			search: 'Search',
			searchPlaceholder: 'Search the guide and the learning pages…',
			experimental: 'This is an experimental implementation',
			repository: 'GitHub repository'
		}
	);
	const lang = $derived(readerLang());
	const t = $derived(text[lang]);
	const other: Lang = $derived(lang === 'ja' ? 'en' : 'ja');
	// Shared paths, so the current link is found in both languages.
	const route = $derived(pathWithoutLang(page.url.pathname));
	const current = (href: string) =>
		href === '/learn'
			? route.startsWith('/learn') && !t.links.some((l) => l.href !== '/learn' && route.startsWith(l.href))
			: route.startsWith(href);
	// The server knows only the path: a prerendered page cannot read the query. The browser adds the query and the
	// hash right before the link is used, because pages such as the playground change the hash after loading.
	const switchPath = $derived(localizedPath(route, other));
	function keepQueryAndHash(event: Event) {
		(event.currentTarget as HTMLAnchorElement).href = switchHref(location, other);
	}

	let mac = $state(true);
	$effect(() => {
		mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
	});
</script>

<header
	class="sticky top-0 z-40 h-14 border-b border-line bg-[var(--header-bg)] backdrop-blur-md backdrop-saturate-150"
>
	<div class="mx-auto flex h-full max-w-[1440px] items-center gap-3 px-4 whitespace-nowrap sm:gap-6 md:px-8">
		<a href={localizedPath('/', lang)} class="flex shrink-0 items-center gap-2" aria-label={t.home}>
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
		<nav class="no-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto text-[14px]" aria-label={t.site}>
			{#each t.links as l (l.href)}
				<a
					href={localizedPath(l.href, lang)}
					class={[
						'rounded-md px-2.5 py-1.5 whitespace-nowrap',
						current(l.href) ? 'bg-surface font-medium text-fg' : 'text-fg-2 hover:bg-surface hover:text-fg',
						!['/guide', '/learn'].includes(l.href) && 'max-sm:hidden'
					]}
					aria-current={current(l.href) ? 'page' : undefined}
				>
					{l.label}
				</a>
			{/each}
		</nav>
		<div class="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
			<a
				href={switchPath}
				hreflang={other}
				lang={other}
				data-sveltekit-reload
				class="flex h-8 items-center rounded-md px-2 text-[13px] text-fg-2 hover:bg-surface hover:text-fg"
				onpointerenter={keepQueryAndHash}
				onpointerdown={keepQueryAndHash}
				onfocus={keepQueryAndHash}
				onclick={keepQueryAndHash}>{other === 'en' ? 'English' : '日本語'}</a
			>
			<button
				type="button"
				class="flex h-8 items-center gap-2 rounded-md border border-line bg-raised pr-1.5 pl-2.5 text-[13px] text-muted hover:border-line-strong hover:text-fg max-sm:size-8 max-sm:justify-center max-sm:p-0 md:w-56"
				onclick={() => (search.open = true)}
				aria-label={t.search}
				aria-keyshortcuts="Meta+K Control+K /"
			>
				<Icon name="search" size={15} />
				<span class="hidden md:inline">{t.searchPlaceholder}</span>
				<span class="ml-auto hidden items-center gap-0.5 sm:flex"
					><span class="kbd">{mac ? '⌘' : 'Ctrl'}</span><span class="kbd">K</span></span
				>
			</button>
			<span
				class="hidden rounded-full border border-line px-2 py-0.5 font-mono text-[11px] tracking-normal text-muted lg:inline"
				title={t.experimental}>experimental</span
			>
			<a
				href={REPO_URL}
				class="flex size-8 items-center justify-center rounded-md text-fg-2 hover:bg-surface hover:text-fg max-sm:hidden"
				rel="noopener"
				aria-label={t.repository}><Icon name="github" size={18} /></a
			>
			<ThemeToggle />
		</div>
	</div>
</header>
