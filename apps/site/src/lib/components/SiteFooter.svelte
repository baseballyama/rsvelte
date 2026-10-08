<script lang="ts">
	import { bilingual, localizedPath } from '$lib/i18n';
	import { readerLang } from '$lib/lang.svelte';
	import { REPO_URL } from '$lib/site';

	let { rev }: { rev: string } = $props();

	const text = bilingual(
		{
			license: '利用・改変・再配布を認めるライセンス',
			links: [
				{ href: '/why', label: 'なぜrsvelteか' },
				{ href: '/guide', label: '使い方ガイド' },
				{ href: '/learn', label: '開発者向けの教材' },
				{ href: '/learn/reference', label: 'リファレンス' }
			],
			build: 'このサイトをビルドしたコミット'
		},
		{
			license: 'A license that allows use, changes, and redistribution',
			links: [
				{ href: '/why', label: 'Why rsvelte' },
				{ href: '/guide', label: 'User guide' },
				{ href: '/learn', label: 'Guide for developers' },
				{ href: '/learn/reference', label: 'Reference' }
			],
			build: 'The commit that built this site'
		}
	);
	const lang = $derived(readerLang());
	const t = $derived(text[lang]);
</script>

<footer class="mt-24 border-t border-line">
	<div
		class="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-8 text-[13px] text-muted md:px-8"
	>
		<span class="font-mono tracking-normal text-fg-2">rsvelte</span>
		<span>{t.license}</span>
		{#each t.links as link (link.href)}<a class="hover:text-fg" href={localizedPath(link.href, lang)}>{link.label}</a>{/each}
		<a class="hover:text-fg" href={REPO_URL} rel="noopener">GitHub</a>
		<a
			class="font-mono tracking-normal hover:text-fg md:ml-auto"
			href="{REPO_URL}/commit/{rev}"
			rel="noopener"
			title={t.build}>build {rev.slice(0, 10)}</a
		>
	</div>
</footer>
