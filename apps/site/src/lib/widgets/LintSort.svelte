<script lang="ts">
	import Figure from '$lib/components/Figure.svelte';
	import { LineIndex } from '$lib/kernel/source';

	// The kernel test's rule: report every 'x' (optionally shifted), under the rule's own id.
	interface Finding {
		code: string;
		startOffset: number;
		seq: number;
	}

	let text = $state('x.x\n😀x');
	let order = $state(['b', 'a']);

	const index = $derived(new LineIndex(text));
	const reported = $derived.by(() => {
		const out: Finding[] = [];
		for (const code of order) {
			index.chars().forEach((c) => {
				if (c.ch === 'x') out.push({ code, startOffset: c.byte, seq: out.length });
			});
		}
		return out;
	});
	// Array.prototype.sort is stable, like Rust's sort_by_key.
	const sorted = $derived([...reported].sort((p, q) => p.startOffset - q.startOffset));
	const position = (b: number) => {
		const lc = index.lineCol(b);
		return `${lc.line}:${lc.column + 1}`;
	};
</script>

<Figure label="図 7.1 · 報告順と出力順">
	{#snippet controls()}
		<button type="button" class="btn-ghost" onclick={() => (order = [...order].reverse())}>ルールの順を入れ替え</button>
	{/snippet}
	<div class="p-4">
		<label class="mb-1.5 block font-mono text-[12px] tracking-normal text-muted" for="lint-text">文書（x が指摘される）</label>
		<textarea id="lint-text" class="field h-14 resize-y" bind:value={text} spellcheck="false"></textarea>
		<div class="mt-4 grid gap-6 font-mono text-[12.5px] tracking-normal sm:grid-cols-2">
			<div>
				<div class="text-muted">ルールが報告した順（{order.join(' → ')}）</div>
				<ol class="mt-1.5 space-y-0.5">
					{#each reported as f (f.seq)}
						<li><span class={f.code === 'a' ? 'text-c-src' : 'text-c-gen'}>{f.code}</span> @ {f.startOffset}</li>
					{/each}
				</ol>
			</div>
			<div>
				<div class="text-muted">run の戻り値（lo で安定ソート）→ 行:列</div>
				<ol class="mt-1.5 space-y-0.5">
					{#each sorted as f (f.seq)}
						<li>
							<span class={f.code === 'a' ? 'text-c-src' : 'text-c-gen'}>{f.code}</span> @ {f.startOffset}
							<span class="text-muted">→ {position(f.startOffset)}</span>
						</li>
					{/each}
				</ol>
			</div>
		</div>
	</div>
	{#snippet caption()}
		同じ位置の指摘は、先に走ったルールのものが先に来ます。列は ESLint と同じく 1 から数えた ユニコードの16ビット符号化方式 の単位で、😀 のあとの x は 3 列目です。
	{/snippet}
</Figure>
