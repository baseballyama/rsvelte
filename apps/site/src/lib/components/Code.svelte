<script lang="ts">
	import { page } from '$app/state';
	import { REPO_URL } from '$lib/site';
	import Icon from './Icon.svelte';

	interface Excerpt {
		key: string;
		name: string;
		path: string;
		startLine: number;
		endLine: number;
		code: string;
		markup: string;
	}

	let {
		item,
		mark = [],
		caption
	}: {
		item: Excerpt;
		/** Lines containing any of these strings are highlighted; each must match, so a stale one fails. */
		mark?: string[];
		caption?: string;
	} = $props();

	const rev = $derived(page.data.rev as string);
	const clean = $derived(page.data.clean as boolean);
	const markup = $derived.by(() => {
		if (mark.length === 0) return item.markup;
		const lines = item.code.split('\n');
		for (const m of mark) {
			if (!lines.some((l) => l.includes(m))) throw new Error(`${item.key}: no line contains ${JSON.stringify(m)}`);
		}
		let n = -1;
		return item.markup.replace(/<span class="line">/g, () => {
			n++;
			return mark.some((m) => lines[n]?.includes(m)) ? '<span class="line hl">' : '<span class="line">';
		});
	});
	const gutter = $derived(`${String(item.endLine).length + 1}ch`);
	const href = $derived(`${REPO_URL}/blob/${rev}/${item.path}#L${item.startLine}-L${item.endLine}`);
	const dir = $derived(item.path.slice(0, item.path.lastIndexOf('/') + 1));
	const file = $derived(item.path.slice(item.path.lastIndexOf('/') + 1));
	let copied = $state(false);

	async function copy(e: MouseEvent) {
		const pre = (e.currentTarget as HTMLElement).closest('figure')?.querySelector('pre');
		if (!pre) return;
		await navigator.clipboard.writeText(pre.innerText.replace(/\n$/, ''));
		copied = true;
		setTimeout(() => (copied = false), 1200);
	}
</script>

<figure class="group/code my-7 overflow-hidden rounded-lg border border-line bg-sunken">
	<figcaption
		class="flex items-center justify-between gap-3 border-b border-line bg-surface/60 py-1.5 pr-1.5 pl-3 font-mono text-[12px] leading-5 tracking-normal text-muted"
	>
		<span class="flex min-w-0 items-center gap-2" title={item.key}>
			<Icon name="file" size={13} class="opacity-70" />
			<span class="min-w-0 truncate"
				><span class="max-sm:hidden">{dir}</span><span class="text-fg-2">{file}</span></span
			>
			<span class="shrink-0 rounded-sm bg-bg px-1.5 text-fg-2 ring-1 ring-line">{item.name}</span>
		</span>
		<span class="flex shrink-0 items-center gap-1">
			{#if clean}
				<a
					class="flex items-center gap-1 rounded-sm px-1.5 py-0.5 hover:bg-bg hover:text-accent tnum"
					{href}
					rel="noopener"
					title="GitHub で {rev.slice(0, 7)} の該当行を開く"
					>L{item.startLine}–{item.endLine}<Icon name="external" size={11} class="opacity-70" /></a
				>
			{:else}
				<span class="px-1.5 tnum" title="crates/ に未コミットの変更がある状態でビルドされたため、行リンクはありません"
					>L{item.startLine}–{item.endLine}</span
				>
			{/if}
			<button
				type="button"
				class="flex size-7 items-center justify-center rounded-sm hover:bg-bg hover:text-fg [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/code:opacity-100 focus-visible:opacity-100"
				onclick={copy}
				aria-label={copied ? 'コピーしました' : 'コードをコピー'}
				title={copied ? 'コピーしました' : 'コピー'}
			>
				{#if copied}<Icon name="check" size={14} class="text-ok" />{:else}<Icon name="copy" size={14} />{/if}
			</button>
		</span>
	</figcaption>
	<div
		class="code-lines thin-scrollbar overflow-x-auto py-3.5 text-[13.5px] leading-[1.7]"
		style:--start={item.startLine - 1}
		style:--gutter={gutter}
	>
		{@html markup}
	</div>
	{#if caption}
		<p class="border-t border-line px-4 py-2.5 text-[14px] leading-[1.75] text-fg-2">{caption}</p>
	{/if}
</figure>
