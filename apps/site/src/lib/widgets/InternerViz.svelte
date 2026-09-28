<script lang="ts">
	import Figure from '$lib/components/Figure.svelte';
	import { Interner, type InternResult } from '$lib/kernel/interner';

	const SAMPLE = ['count', '$', 'state', 'button', 'root', 'text', 'count', 'template_effect', 'set_text', 'get', 'count', 'delegated', 'update', 'count', 'append', '$$anchor', 'button'];

	let names: string[] = $state([]);
	let input = $state('');

	// Replaying from the start keeps the figure a pure function of `names`.
	const replay = $derived.by(() => {
		const i = new Interner();
		const results: InternResult[] = names.map((n) => i.intern(n));
		return { i, results };
	});
	const last = $derived(replay.results.at(-1));
	const probed = $derived(new Set(last?.probes.map((p) => p.slot) ?? []));
	const lastSlot = $derived(last?.probes.at(-1)?.slot);
	const cols = $derived(replay.i.table.length > 64 ? 16 : 8);

	function add(n: string) {
		const t = n.trim();
		if (t) names = [...names, t];
	}
	function next() {
		add(SAMPLE[names.length % SAMPLE.length]);
	}
	function many() {
		names = [...names, ...Array.from({ length: 20 }, (_, k) => `n${names.length + k}`)];
	}
</script>

<Figure label="図 3.1 · Interner の中身" wide>
	{#snippet controls()}
		<button type="button" class="btn-ghost" onclick={next}>次の名前</button>
		<button type="button" class="btn-ghost" onclick={many}>+20</button>
		<button type="button" class="btn-ghost" onclick={() => (names = [])} disabled={names.length === 0}>リセット</button>
	{/snippet}
	<div class="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
		<div class="min-w-0 border-b border-line p-4 lg:border-r lg:border-b-0">
			<form
				class="flex gap-2"
				onsubmit={(e) => {
					e.preventDefault();
					add(input);
					input = '';
				}}
			>
				<input class="field py-1" bind:value={input} placeholder="名前を入れて Enter" aria-label="インターンする名前" />
			</form>
			<div class="mt-4 font-mono text-[12.5px] leading-[1.8] tracking-normal">
				{#if last}
					<div>
						intern(<span class="text-c-src">"{names.at(-1)}"</span>) → <span class="text-accent">Atom({last.atom})</span>
						<span class="text-muted">{last.fresh ? '新規' : '既存'}{last.grew ? ' · テーブルを拡張' : ''}</span>
					</div>
					<div class="text-muted">
						プローブ: {last.probes.map((p) => `${p.slot}${p.stored ? `(${p.stored})` : '(空)'}`).join(' → ')}
					</div>
				{:else}
					<div class="text-muted">まだ何もインターンしていません。「次の名前」を押すと、Counter の出力に出てくる名前を順に入れます。</div>
				{/if}
			</div>
			<div class="mt-4 font-mono text-[11px] tracking-normal text-muted">buf（ends の位置で区切って表示）</div>
			<div class="mt-1 flex flex-wrap font-mono text-[12.5px] tracking-normal">
				{#each replay.i.ends as end, id (id)}
					{@const start = id === 0 ? 0 : replay.i.ends[id - 1]}
					<span class={['border-r border-line-strong px-1', last?.atom === id && 'bg-accent-wash']}>
						<span class="mr-1 text-[10px] text-muted">{id}</span>{replay.i.buf.slice(start, end)}
					</span>
				{/each}
			</div>
			<div class="mt-3 font-mono text-[11px] tracking-normal text-muted">
				ends = [{replay.i.ends.join(', ')}]
			</div>
		</div>
		<div class="min-w-0 p-4">
			<div class="mb-2 font-mono text-[11px] tracking-normal text-muted">
				table · 容量 {replay.i.table.length || 0} · 使用 {replay.i.ends.length} · 負荷率 {replay.i.table.length
					? (replay.i.ends.length / replay.i.table.length).toFixed(2)
					: '—'}
			</div>
			{#if replay.i.table.length === 0}
				<p class="text-[14px] text-muted">テーブルは最初の intern で作られます（容量 64）。</p>
			{:else}
				<div class="grid gap-px bg-line" style:grid-template-columns="repeat({cols}, minmax(0, 1fr))">
					{#each replay.i.table as v, slot (slot)}
						<div
							class={[
								'flex h-7 items-center justify-center font-mono text-[10.5px] tracking-normal tnum',
								slot === lastSlot ? 'bg-accent text-bg' : probed.has(slot) ? 'bg-accent-wash' : v ? 'bg-surface' : 'bg-bg text-muted'
							]}
							title="slot {slot}{v ? `: Atom(${v - 1}) "${replay.i.get(v - 1)}"` : ': 空'}"
						>
							{v ? v - 1 : '·'}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
	{#snippet caption()}
		表のマスには、その slot が指す Atom の番号が入っています（Rust は「番号 + 1」を格納し、0 を空として使います）。橙色は直前の
		intern が調べた slot です。ハッシュ関数は FxHash ではなく FNV-1a なので、どの slot に入るかは Rust と違いますが、表の形、負荷率
		0.5 での拡張、線形プローブの順序は同じです。
	{/snippet}
</Figure>
