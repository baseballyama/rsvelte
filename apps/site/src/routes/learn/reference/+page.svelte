<script lang="ts">
	import { page } from '$app/state';
	import { REPO_URL } from '$lib/site';

	let { data } = $props();

	interface Viewed {
		key: string;
		name: string;
		path: string;
		startLine: number;
		endLine: number;
		html: string;
	}

	let q = $state('');
	let crate = $state<'all' | 'kernel' | 'plugins'>('kernel');
	let viewed: Viewed | null = $state(null);
	let loading = $state(false);
	let failed: string | null = $state(null);
	const cache = new Map<string, { path: string; items: Omit<Viewed, 'path'>[] }>();

	const results = $derived.by(() => {
		const needle = q.trim().toLowerCase();
		return data.modules
			.filter((m) => crate === 'all' || (crate === 'kernel') === m.key.startsWith('kernel/'))
			.map((m) => ({
				...m,
				items: m.items.filter((i) => !needle || i.name.toLowerCase().includes(needle) || i.doc.toLowerCase().includes(needle))
			}))
			.filter((m) => m.items.length > 0);
	});
	const count = $derived(results.reduce((n, m) => n + m.items.length, 0));

	async function view(moduleKey: string, itemKey: string) {
		failed = null;
		loading = true;
		try {
			let mod = cache.get(moduleKey);
			if (!mod) {
				const res = await fetch(`/api/source/${moduleKey}`);
				if (!res.ok) throw new Error(`${res.status}`);
				mod = await res.json();
				cache.set(moduleKey, mod!);
			}
			const it = mod!.items.find((i) => i.key === itemKey);
			if (!it) throw new Error(`no item ${itemKey}`);
			viewed = { ...it, path: mod!.path };
		} catch (e) {
			failed = `読み込めませんでした（${(e as Error).message}）`;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head><title>リファレンス — rsvelte Learn</title></svelte:head>

<header class="mb-8">
	<span class="font-mono text-[13px] tracking-normal text-muted">付録</span>
	<h1 class="mt-1 text-[30px] leading-[1.3] font-semibold sm:text-[36px]" style="font-stretch: 92%">リファレンス</h1>
	<p class="mt-4 max-w-[40em] text-[17px] leading-[1.8] text-fg-2">
		サイトのビルド時にソースから切り出した項目の一覧です。項目を選ぶと、その場でコードを取得して表示します。テストは除いています。
	</p>
</header>

<div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
	<div class="min-w-0">
		<div class="sticky top-14 z-10 flex flex-wrap items-center gap-2 bg-bg py-3">
			<input class="field max-w-72 py-1.5" type="search" placeholder="名前や説明で絞り込む" bind:value={q} aria-label="項目を絞り込む" />
			{#each [['kernel', 'カーネル'], ['plugins', 'プラグインなど'], ['all', 'すべて']] as [v, name] (v)}
				<button type="button" class="btn-ghost" aria-pressed={crate === v} onclick={() => (crate = v as typeof crate)}>{name}</button>
			{/each}
			<span class="ml-auto font-mono text-[12px] tracking-normal text-muted tnum">{count} 項目</span>
		</div>
		{#each results as m (m.key)}
			<section class="mt-6">
				<h2 class="flex items-baseline justify-between border-b border-line-strong pb-1 font-mono text-[13px] font-medium tracking-normal">
					<span>{m.key}</span><span class="text-muted">{m.lines} 行</span>
				</h2>
				<ul>
					{#each m.items as it (it.key)}
						<li class="border-b border-line">
							<button
								type="button"
								class={['grid w-full grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 py-1.5 text-left', viewed?.key === it.key ? 'bg-accent-wash' : 'hover:bg-surface']}
								onclick={() => view(m.key, it.key)}
							>
								<span class="pl-1 font-mono text-[11.5px] leading-[1.9] tracking-normal text-muted">{it.kind.replace('!', '')}</span>
								<span class="min-w-0">
									<code class="text-[13px]">{it.name}</code>
									{#if it.doc}<span class="block truncate text-[13px] text-muted" lang="en">{it.doc}</span>{/if}
								</span>
							</button>
						</li>
					{/each}
				</ul>
			</section>
		{:else}
			<p class="mt-6 text-muted">一致する項目はありません。</p>
		{/each}
	</div>
	<div class="min-w-0">
		<div class="sticky top-[72px]">
			{#if viewed}
				<figure class="overflow-hidden rounded-sm border border-line bg-sunken">
					<figcaption class="flex justify-between gap-4 border-b border-line px-3 py-1.5 font-mono text-[12px] tracking-normal text-muted">
						<span class="truncate">{viewed.path} · <span class="text-fg-2">{viewed.name}</span></span>
						{#if page.data.clean}
							<a class="shrink-0 hover:text-accent" href="{REPO_URL}/blob/{page.data.rev}/{viewed.path}#L{viewed.startLine}-L{viewed.endLine}" rel="noopener"
								>L{viewed.startLine}–{viewed.endLine}</a
							>
						{:else}
							<span class="shrink-0">L{viewed.startLine}–{viewed.endLine}</span>
						{/if}
					</figcaption>
					<div
						class="code-lines max-h-[calc(100dvh-160px)] overflow-auto py-3 text-[13px] leading-[1.65]"
						style:--start={viewed.startLine - 1}
						style:--gutter="{String(viewed.endLine).length + 1}ch"
					>
						{@html viewed.html}
					</div>
				</figure>
			{:else}
				<div class="rounded-sm border border-dashed border-line-strong p-6 text-[14px] text-muted">
					{loading ? '読み込み中…' : (failed ?? '左の一覧から項目を選んでください。')}
				</div>
			{/if}
		</div>
	</div>
</div>
