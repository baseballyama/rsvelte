<script lang="ts">
	import Figure from '$lib/components/Figure.svelte';
	import { LineIndex } from '$lib/kernel/source';

	let text = $state("let 名前 = '😀';\nx");
	let at = $state(0);
	let qLine = $state(1);
	let qCol = $state(12);

	const index = $derived(new LineIndex(text));
	const chars = $derived(index.chars());
	const lc = $derived(index.lineCol(Math.min(at, index.bytes.length)));
	const cur = $derived(chars.find((c) => c.byte === at));
	const off = $derived(index.offset(qLine, qCol));
	const lineEnd = $derived.by(() => {
		const start = index.lineStarts[qLine - 1];
		if (start === undefined) return null;
		const nl = index.bytes.indexOf(0x0a, start);
		return nl === -1 ? index.bytes.length : nl;
	});

	const hex = (b: number) => b.toString(16).toUpperCase().padStart(2, '0');
</script>

<Figure label="図 2.1 · ユニコードの8ビット符号化方式 バイト、行、ユニコードの16ビット符号化方式 列" wide>
	{#snippet controls()}
		{#each [["let 名前 = '😀';\nx", '日本語と絵文字'], ['a😀b\nc', 'Rust のテスト'], ['abc\ndef', 'ASCII']] as [t, name] (name)}
			<button type="button" class="btn-ghost" aria-pressed={text === t} onclick={() => ((text = t), (at = 0))}>{name}</button>
		{/each}
	{/snippet}
	<div class="grid gap-0 lg:grid-cols-[minmax(0,1fr)_260px]">
		<div class="min-w-0 border-b border-line p-4 lg:border-r lg:border-b-0">
			<label class="mb-1.5 block font-mono text-[12px] tracking-normal text-muted" for="li-text">テキスト（編集できます）</label>
			<textarea id="li-text" class="field h-16 resize-y" bind:value={text} spellcheck="false"></textarea>
			<div class="mt-4 flex flex-wrap gap-y-3">
				{#each chars as c (c.byte)}
					<button
						type="button"
						class={[
							'flex flex-col items-stretch border-y border-l border-line text-left last:border-r',
							c.byte === at ? 'bg-accent-wash' : 'hover:bg-surface',
							c.ch === '\n' && 'mr-4'
						]}
						onmouseenter={() => (at = c.byte)}
						onfocus={() => (at = c.byte)}
						onclick={() => (at = c.byte)}
					>
						<span class="px-1.5 pt-1 text-center font-mono text-[15px]" class:text-muted={c.ch === '\n'}
							>{c.ch === '\n' ? '↵' : c.ch}</span
						>
						<span class="flex border-t border-line">
							{#each Array.from(index.bytes.subarray(c.byte, c.byte + c.len)) as b, k (k)}
								<span
									class={['px-1 font-mono text-[10px] tracking-normal', c.len > 1 ? 'text-c-src' : 'text-muted']}
									>{hex(b)}</span
								>
							{/each}
						</span>
						<span class="px-1 pb-0.5 font-mono text-[10px] tracking-normal text-muted tnum">{c.byte}</span>
					</button>
				{/each}
			</div>
		</div>
		<div class="p-4 font-mono text-[12.5px] leading-[1.8] tracking-normal">
			<div class="text-muted">byte {at}{cur ? ` · '${cur.ch === '\n' ? '\\n' : cur.ch}' ${cur.len}B` : ''}</div>
			<dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-4">
				<dt class="text-muted">line</dt>
				<dd class="tnum">{lc.line}</dd>
				<dt class="text-muted">column</dt>
				<dd class="tnum">{lc.column} <span class="text-muted">(ユニコードの16ビット符号化方式)</span></dd>
				<dt class="text-muted">character</dt>
				<dd class="tnum">{lc.character}</dd>
			</dl>
			<div class="mt-4 text-muted">line_starts</div>
			<div class="tnum">[{index.lineStarts.join(', ')}]</div>
			<div class="mt-3 text-muted">wide <span class="text-[11px]">(byte, utf16 before)</span></div>
			<div class="tnum">
				{#if index.wide.length === 0}[] <span class="text-muted">— 英数字などの基本文字 なので作らない</span>{:else}[{index.wide
						.map((w) => `(${w.byte}, ${w.utf16})`)
						.join(', ')}]{/if}
			</div>
		</div>
	</div>
	<div class="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line bg-surface px-4 py-2.5 font-mono text-[12.5px] tracking-normal">
		<span class="text-muted">バイト位置の検索</span>
		<label class="flex items-center gap-1">line <input class="field w-16 py-0.5" type="number" min="0" bind:value={qLine} /></label>
		<label class="flex items-center gap-1">column <input class="field w-16 py-0.5" type="number" min="0" bind:value={qCol} /></label>
		<span>= {off === null ? 'None' : `Some(${off})`}</span>
		{#if off === null && lineEnd !== null}
			{@const endCol = index.lineCol(lineEnd).column}
			<span class="text-muted">{qCol > endCol ? `この行の列は ${endCol} まで` : '列がサロゲートペアの内側'}</span>
		{/if}
	</div>
	{#snippet caption()}
		文字にカーソルを当てると、そのバイト位置を <code>line_column</code> に通した結果が右に出ます。下の段は逆向きの
		<code>offset</code> です。数値は Rust の <code>LineIndex</code> を移植したコードで計算しています。
	{/snippet}
</Figure>
