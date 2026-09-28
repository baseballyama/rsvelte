<script lang="ts">
	import { page } from '$app/state';
	import { REPO_URL } from '$lib/site';

	interface Excerpt {
		key: string;
		name: string;
		path: string;
		startLine: number;
		endLine: number;
		code: string;
		html: string;
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
	const html = $derived.by(() => {
		if (mark.length === 0) return item.html;
		const lines = item.code.split('\n');
		for (const m of mark) {
			if (!lines.some((l) => l.includes(m))) throw new Error(`${item.key}: no line contains ${JSON.stringify(m)}`);
		}
		let n = -1;
		return item.html.replace(/<span class="line">/g, () => {
			n++;
			return mark.some((m) => lines[n]?.includes(m)) ? '<span class="line hl">' : '<span class="line">';
		});
	});
	const gutter = $derived(`${String(item.endLine).length + 1}ch`);
	const href = $derived(`${REPO_URL}/blob/${rev}/${item.path}#L${item.startLine}-L${item.endLine}`);
	let copied = $state(false);

	async function copy(e: MouseEvent) {
		const pre = (e.currentTarget as HTMLElement).closest('figure')?.querySelector('pre');
		if (!pre) return;
		await navigator.clipboard.writeText(pre.innerText.replace(/\n$/, ''));
		copied = true;
		setTimeout(() => (copied = false), 1200);
	}
</script>

<figure class="group my-6 overflow-hidden rounded-sm border border-line bg-sunken">
	<figcaption
		class="flex items-center justify-between gap-4 border-b border-line px-3 py-1.5 font-mono text-[12px] leading-5 tracking-normal text-muted"
	>
		<span class="min-w-0 truncate" title={item.key}>
			{item.path}<span class="text-fg-2"> · {item.name}</span>
		</span>
		<span class="flex shrink-0 items-center gap-3">
			<button
				type="button"
				class="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-fg"
				onclick={copy}>{copied ? 'コピーしました' : 'コピー'}</button
			>
			{#if clean}
				<a class="hover:text-accent" {href} rel="noopener">L{item.startLine}–{item.endLine} @ {rev.slice(0, 7)}</a>
			{:else}
				<span title="crates/ に未コミットの変更がある状態でビルドされたため、行リンクはありません"
					>L{item.startLine}–{item.endLine} @ 作業ツリー</span
				>
			{/if}
		</span>
	</figcaption>
	<div
		class="code-lines overflow-x-auto py-3 text-[13.5px] leading-[1.65]"
		style:--start={item.startLine - 1}
		style:--gutter={gutter}
	>
		{@html html}
	</div>
	{#if caption}
		<p class="border-t border-line px-3 py-2 text-[14px] leading-[1.7] text-fg-2">{caption}</p>
	{/if}
</figure>
