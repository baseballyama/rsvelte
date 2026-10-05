<script lang="ts">
	import { bilingual } from '$lib/i18n';
	import { readerLang } from '$lib/lang.svelte';
	import { REPO_URL, type Chapter } from '$lib/site';
	import Icon from './Icon.svelte';

	let { chapter, active, progress }: { chapter: Chapter; active: string | null; progress: number } = $props();

	const text = bilingual(
		{ label: 'このページの節', heading: 'このページ', top: '先頭へ戻る' },
		{ label: 'Sections on this page', heading: 'On this page', top: 'Back to top' }
	);
	const t = $derived(text[readerLang()]);

	const index = $derived(chapter.sections.findIndex((s) => s.id === active));
	const sourceHref = $derived(
		chapter.module ? `${REPO_URL}/blob/main/crates/kernel/src/${chapter.module.split('/')[1]}.rs` : undefined
	);
</script>

<nav aria-label={t.label} class="text-[13px] leading-[1.55]">
	<p class="eyebrow mb-3 flex items-center justify-between">
		<span>{t.heading}</span>
		<span class="tnum normal-case">{Math.round(progress * 100)}%</span>
	</p>
	<ol class="border-l border-line">
		{#each chapter.sections as s, i (s.id)}
			<li>
				<a
					href="#{s.id}"
					class={[
						'-ml-px flex gap-2 border-l py-[5px] pl-4',
						active === s.id
							? 'border-accent text-fg'
							: i < index
								? 'border-transparent text-fg-2 hover:text-fg'
								: 'border-transparent text-muted hover:text-fg-2'
					]}
					aria-current={active === s.id ? 'location' : undefined}
				>
					<span class="w-4 shrink-0 pt-px font-mono text-[11px] tracking-normal opacity-70 tnum">{i + 1}</span>
					<span>{s.title}</span>
				</a>
			</li>
		{/each}
	</ol>
	<div class="mt-6 space-y-2 border-t border-line pt-4 text-muted">
		{#if sourceHref}
			<a href={sourceHref} rel="noopener" class="flex items-center gap-2 hover:text-fg">
				<Icon name="file" size={14} />
				<span class="truncate font-mono text-[12px] tracking-normal">{chapter.module?.split('/')[1]}.rs</span>
			</a>
		{/if}
		<a href="#top" class="flex items-center gap-2 hover:text-fg" onclick={(e) => { e.preventDefault(); scrollTo({ top: 0 }); }}>
			<Icon name="arrow-left" size={14} class="rotate-90" />
			<span>{t.top}</span>
		</a>
	</div>
</nav>
