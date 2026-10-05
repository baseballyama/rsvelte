<script lang="ts">
	import { goto } from '$app/navigation';
	import { bilingual, localizedPath, type Lang } from '$lib/i18n';
	import { readerLang } from '$lib/lang.svelte';
	import { appendixIn, chaptersIn } from '$lib/site';
	import { guideSectionsIn } from '$lib/guide';
	import Icon from './Icon.svelte';
	import { search } from './search.svelte';

	interface Entry {
		href: string;
		title: string;
		/** Chapter number and title, for a section; the abstract, for a chapter. */
		context: string;
		kind: 'chapter' | 'section' | 'appendix' | 'guide';
		number?: string;
		haystack: string;
	}

	const text = bilingual(
		{
			guide: '使い方ガイド',
			guideContext: '導入、コンパイル、整形、検査、型チェック、Web アプリへの組み込み',
			guideKeywords: '使い方 ガイド 導入 コンパイル 整形 検査 型チェック WebAssembly',
			appendixKeyword: '付録',
			label: 'ガイド・教材を検索',
			placeholder: '使い方や教材を探す（例: 整形、型、並列）',
			none: (q: string) => `「${q}」に一致するページ・節はありません`,
			choose: '選ぶ',
			open: '開く',
			count: (n: number) => `${n} 件`
		},
		{
			guide: 'User guide',
			guideContext: 'Setup, compiling, formatting, linting, type checking, and use in a web app',
			guideKeywords: 'user guide setup compile format lint type check WebAssembly',
			appendixKeyword: 'appendix',
			label: 'Search the guide and the learning pages',
			placeholder: 'Search the guide and the learning pages (for example: format, types, parallel)',
			none: (q: string) => `No page or section matches "${q}"`,
			choose: 'select',
			open: 'open',
			count: (n: number) => `${n} ${n === 1 ? 'result' : 'results'}`
		}
	);
	const lang = $derived(readerLang());
	const t = $derived(text[lang]);

	// Only pages in the reader's language are listed, with links in that language.
	function entriesIn(lang: Lang): Entry[] {
		const t = text[lang];
		const guide = localizedPath('/guide', lang);
		return [
		{
			href: guide,
			title: t.guide,
			context: t.guideContext,
			kind: 'guide',
			haystack: t.guideKeywords.toLowerCase()
		},
		...guideSectionsIn(lang).map((section) => ({
			href: `${guide}#${section.id}`,
			title: section.title,
			context: t.guide,
			kind: 'section' as const,
			haystack: `${section.title} ${t.guide}`.toLowerCase()
		})),
		...chaptersIn(lang).flatMap((c) => [
			{
				href: c.href,
				title: c.title,
				context: c.abstract,
				kind: 'chapter' as const,
				number: c.number,
				haystack: `${c.number} ${c.title} ${c.abstract}`.toLowerCase()
			},
			...c.sections.map((s) => ({
				href: `${c.href}#${s.id}`,
				title: s.title,
				context: `${c.number} ${c.title}`,
				kind: 'section' as const,
				haystack: `${s.title} ${c.title}`.toLowerCase()
			}))
		]),
		...appendixIn(lang).map((a) => ({
			href: a.href,
			title: a.title,
			context: a.abstract,
			kind: 'appendix' as const,
			haystack: `${a.title} ${a.abstract} ${t.appendixKeyword}`.toLowerCase()
		}))
		];
	}
	const entries = $derived(entriesIn(lang));

	let dialog: HTMLDialogElement | undefined = $state();
	let input: HTMLInputElement | undefined = $state();
	let q = $state('');
	let sel = $state(0);

	const results = $derived.by(() => {
		const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
		if (terms.length === 0) return entries.filter((e) => e.kind !== 'section');
		return entries.filter((e) => terms.every((t) => e.haystack.includes(t))).slice(0, 40);
	});

	$effect(() => {
		void q;
		sel = 0;
	});

	$effect(() => {
		if (!dialog) return;
		if (search.open && !dialog.open) {
			dialog.showModal();
			input?.select();
		} else if (!search.open && dialog.open) {
			dialog.close();
		}
	});

	function choose(e: Entry | undefined) {
		if (!e) return;
		search.open = false;
		q = '';
		goto(e.href);
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			sel = Math.min(sel + 1, results.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			sel = Math.max(sel - 1, 0);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			choose(results[sel]);
		}
	}

	$effect(() => {
		dialog?.querySelector(`[data-i="${sel}"]`)?.scrollIntoView({ block: 'nearest' });
	});

	function onglobal(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			search.open = !search.open;
			return;
		}
		const t = e.target as HTMLElement | null;
		const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
		if (e.key === '/' && !typing && !search.open) {
			e.preventDefault();
			search.open = true;
		}
	}
</script>

<svelte:window onkeydown={onglobal} />

<dialog
	bind:this={dialog}
	class="palette m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/30 backdrop:backdrop-blur-[2px] sm:mx-auto sm:mt-[12vh] sm:h-auto sm:max-w-[600px]"
	onclose={() => (search.open = false)}
	onclick={(e) => {
		if (e.target === dialog) search.open = false;
	}}
	aria-label={t.label}
>
	<div
		class="flex h-full flex-col overflow-hidden border-line bg-raised text-fg sm:h-auto sm:max-h-[70vh] sm:rounded-[10px] sm:border sm:shadow-[var(--shadow-pop)]"
	>
		<div class="flex items-center gap-3 border-b border-line px-4">
			<Icon name="search" size={18} class="text-muted" />
			<input
				bind:this={input}
				bind:value={q}
				{onkeydown}
				class="h-14 min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-muted"
				placeholder={t.placeholder}
				role="combobox"
				aria-expanded="true"
				aria-controls="palette-results"
				aria-activedescendant={results[sel] ? `palette-${sel}` : undefined}
				autocomplete="off"
				spellcheck="false"
			/>
			<button type="button" class="kbd cursor-pointer" onclick={() => (search.open = false)}>esc</button>
		</div>
		<ul id="palette-results" role="listbox" class="thin-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
			{#each results as r, i (r.href)}
				<li role="option" id="palette-{i}" aria-selected={i === sel} data-i={i}>
					<a
						href={r.href}
						class={[
							'flex items-center gap-3 rounded-md px-3 py-2.5',
							i === sel ? 'bg-accent-wash text-fg' : 'text-fg-2'
						]}
						onmousemove={() => (sel = i)}
						onclick={(e) => {
							e.preventDefault();
							choose(r);
						}}
					>
						<span
							class={[
								'flex size-7 shrink-0 items-center justify-center rounded-sm border font-mono text-[11px] tracking-normal',
								i === sel ? 'border-accent/40 text-accent' : 'border-line text-muted'
							]}
						>
							{#if r.kind === 'chapter'}{r.number}{:else if r.kind === 'section'}<Icon name="hash" size={13} />{:else}<Icon
									name="book"
									size={13}
								/>{/if}
						</span>
						<span class="min-w-0 flex-1">
							<span class="block truncate text-[15px] leading-snug text-fg">{r.title}</span>
							<span class="mt-0.5 block truncate text-[12.5px] leading-snug text-muted">{r.context}</span>
						</span>
						{#if i === sel}<Icon name="arrow-right" size={14} class="text-accent" />{/if}
					</a>
				</li>
			{:else}
				<li class="px-3 py-10 text-center text-[14px] text-muted">{t.none(q)}</li>
			{/each}
		</ul>
		<div
			class="hidden items-center gap-4 border-t border-line px-4 py-2 font-mono text-[11px] tracking-normal text-muted sm:flex"
		>
			<span class="flex items-center gap-1.5"><span class="kbd">↑</span><span class="kbd">↓</span> {t.choose}</span>
			<span class="flex items-center gap-1.5"><span class="kbd">↵</span> {t.open}</span>
			<span class="ml-auto">{t.count(results.length)}</span>
		</div>
	</div>
</dialog>

<style>
	.palette[open] {
		animation: pop 140ms ease-out;
	}
	@keyframes pop {
		from {
			opacity: 0;
			transform: translateY(-6px) scale(0.99);
		}
	}
</style>
