<script lang="ts">
	import { untrack } from 'svelte';
	import SpanRuler from '$lib/components/SpanRuler.svelte';
	import { Emitter } from '$lib/kernel/emit';
	import { LineIndex } from '$lib/kernel/source';

	interface EmitData {
		src: string;
		out: string;
		/** `[generated, src, len]` per mapping, as the emit_mappings example prints them. */
		mappings: number[][];
		file: string;
		target: string;
		rev: string;
	}

	let { data, label }: { data: EmitData; label: string } = $props();

	const emitter = $derived.by(() => {
		const e = new Emitter();
		e.out = data.out;
		e.mappings = data.mappings.map((m) => {
			if (m.length !== 3) throw new Error(`a mapping is [generated, src, len], got ${JSON.stringify(m)}`);
			return { generated: m[0], src: m[1], len: m[2] };
		});
		return e;
	});
	const srcIndex = $derived(new LineIndex(data.src));
	const outIndex = $derived(new LineIndex(data.out));
	const srcChars = $derived(srcIndex.chars());
	const outChars = $derived(outIndex.chars());
	const marked = $derived(new Set(data.mappings.map((m) => m[0])));

	// Start on the first mapped byte so the figure says something before anyone touches it.
	let pos = $state(untrack(() => data.mappings[0]?.[0] ?? 0));

	const which = $derived(emitter.mappingAt(pos));
	const hit = $derived(emitter.lookup(pos));
	const g = $derived(outIndex.lineCol(pos));
	const s = $derived(hit === null ? null : srcIndex.lineCol(hit));
	const mapping = $derived(which >= 0 ? emitter.mappings[which] : null);

	function pick(e: Event) {
		const b = (e.target as HTMLElement).dataset?.b;
		if (b !== undefined) pos = Number(b);
	}
	function key(e: KeyboardEvent) {
		const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
		if (!step) return;
		e.preventDefault();
		const i = outChars.findIndex((c) => c.byte === pos);
		const next = outChars[Math.min(outChars.length - 1, Math.max(0, i + step))];
		pos = next.byte;
	}
</script>

<figure class="overflow-hidden rounded-sm border border-line">
	<div class="flex items-center justify-between gap-4 border-b border-line bg-surface px-3 py-1.5">
		<span class="font-mono text-[12px] tracking-normal text-muted">{label}</span>
		<span class="font-mono text-[12px] tracking-normal text-muted">
			写像点 {data.mappings.length} · {data.target} · {data.rev.slice(0, 7)}
		</span>
	</div>
	<div class="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
		<div class="min-w-0 border-b border-line md:border-r md:border-b-0">
			<div class="px-3 pt-2 font-mono text-[11px] tracking-normal text-c-src">{data.file}</div>
			<pre
				class="overflow-x-auto px-3 py-2 text-[12.5px] leading-[1.7] [tab-size:2]"
				aria-label="入力"><code
					>{#each srcChars as c (c.byte)}<span class={[hit === c.byte && 'bg-accent text-bg', 'rounded-[2px]']}
							>{c.ch}</span
						>{/each}</code
				></pre>
			<div class="px-3 pb-3">
				<SpanRuler
					title="入力のバイト位置"
					length={srcIndex.bytes.length}
					marks={[
						...data.mappings.map((m) => ({ lo: m[1], hi: m[1] + Math.max(m[2], 1), tone: 'muted' as const })),
						...(hit === null ? [] : [{ lo: hit, hi: hit + 1, tone: 'accent' as const }])
					]}
				/>
			</div>
		</div>
		<div class="min-w-0">
			<div class="px-3 pt-2 font-mono text-[11px] tracking-normal text-c-gen">rsvelte の出力 (JS)</div>
			<div
				class="max-h-[340px] cursor-crosshair overflow-auto px-3 py-2 font-mono text-[12.5px] leading-[1.7] whitespace-pre [tab-size:2] focus-visible:outline-2 focus-visible:outline-accent"
				tabindex="0"
				role="slider"
				aria-valuemin={0}
				aria-valuemax={outIndex.bytes.length - 1}
				aria-valuenow={pos}
				aria-valuetext="出力 {g.line} 行 {g.column} 列"
				aria-label="出力の位置。左右の矢印キーで動かせます"
				onmousemove={pick}
				onclick={pick}
				onkeydown={key}
			>{#each outChars as c (c.byte)}<span
							data-b={c.byte}
							class={[
								'rounded-[2px]',
								c.byte === pos && 'bg-fg text-bg',
								c.byte !== pos && marked.has(c.byte) && 'underline decoration-accent decoration-2 underline-offset-4',
								c.byte !== pos && mapping && c.byte >= mapping.generated && c.byte < pos && 'bg-accent-wash'
							]}>{c.ch}</span
						>{/each}</div>
		</div>
	</div>
	<div
		class="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-line bg-surface px-3 py-2 font-mono text-[12px] tracking-normal tnum"
		aria-live="polite"
	>
		<span><span class="text-c-gen">out</span> {g.line}:{g.column}</span>
		<span class="text-muted">→</span>
		{#if s}
			<span><span class="text-c-src">src</span> {s.line}:{s.column}</span>
			<span class="text-muted">
				写像 #{which} (generated {mapping?.generated}, src {mapping?.src}, len {mapping?.len}) から {pos -
					(mapping?.generated ?? 0)} バイト後
			</span>
		{:else}
			<span class="text-muted">写像なし: 最初の写像点より前</span>
		{/if}
	</div>
</figure>
