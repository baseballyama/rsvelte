<script lang="ts">
	import CrateDiagram from '$lib/components/CrateDiagram.svelte';
	import { chapters } from '$lib/site';
	import SpanFigure from '$lib/widgets/SpanFigure.svelte';

	let { data } = $props();

	const fmt = (n: number) => n.toLocaleString('en-US');
	const mb = (b: number) => (b / 1e6).toFixed(1);
	const arm = (name: string) => {
		const a = data.bench.arms.find((x) => x.name === name);
		if (!a) throw new Error(`no arm ${name}`);
		return a;
	};
	const maxMs = $derived(Math.max(...data.bench.arms.map((a) => a.median)));
	const armNote: Record<string, string> = {
		shared: '文書のタスクがアーティファクトを共有',
		isolated: 'タスクごとに計算し直す',
		nopool: 'バッファプールなし',
		serial: '1 スレッド',
		streaming: '結果を確定した順に捨てる'
	};
	const cmd = 'cargo run --release -p rsv_cli -- run Counter.svelte --task svelte.compile/client';
	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(cmd);
		copied = true;
		setTimeout(() => (copied = false), 1200);
	}
</script>

<svelte:head>
	<title>rsvelte — Svelte のツールチェーンを、ひとつのカーネルで</title>
	<meta
		name="description"
		content="rsvelte は Svelte 5 のコンパイル・整形・lint・型検査を、ひとつの Rust カーネルの上で動かす実験的な実装です。"
	/>
</svelte:head>

<main class="mx-auto max-w-[1400px] px-4 md:px-8 xl:px-12">
	<section class="grid grid-cols-[minmax(0,1fr)] gap-x-12 pt-16 pb-12 md:pt-24 lg:grid-cols-12">
		<h1
			class="text-[38px] leading-[1.18] font-[560] sm:text-[clamp(40px,5vw,64px)] lg:col-span-12"
			style="font-stretch: 88%"
		>
			Svelte のツールチェーンを、<br class="hidden sm:inline" />ひとつのカーネルで。
		</h1>
		<div class="lg:col-span-7">
			<p class="mt-6 max-w-[36em] text-[18px] leading-[1.8] text-fg-2">
				コンパイル、整形、lint、型検査を、同じパースと同じ解析の上で走らせます。文書ごとに一度だけパースし、
				移植していない構文は近似せずに「未対応」と報告します。どこで時間とメモリを使ったかは、カーネル自身が数えます。
			</p>
		</div>
		<div class="mt-8 flex flex-col justify-end gap-4 lg:col-span-5 lg:mt-0 lg:pb-1">
			<div class="flex items-center gap-2 rounded-sm border border-line bg-sunken py-2 pr-2 pl-3">
				<code class="min-w-0 flex-1 truncate text-[13px]" title={cmd}>{cmd}</code>
				<button type="button" class="btn-ghost shrink-0" onclick={copy}>{copied ? 'OK' : 'コピー'}</button>
			</div>
			<div class="flex items-center gap-6 text-[15px]">
				<a
					href="/learn"
					class="inline-flex h-10 items-center rounded-sm bg-fg px-4 font-medium text-bg hover:bg-accent"
					>カーネルを学ぶ</a
				>
				<a href="/learn/playground" class="link">Doc プレイグラウンド</a>
			</div>
		</div>
	</section>

	<section aria-labelledby="hero-fig">
		<h2 id="hero-fig" class="sr-only">出力と入力の対応</h2>
		<SpanFigure data={data.counter} label="図 0 · 出力の位置から入力の位置へ" />
		<p class="mt-3 max-w-[46em] text-[14px] leading-[1.7] text-fg-2">
			<span class="c-gen">出力</span>の上でカーソルを動かすと、その文字がどの<span class="c-src">入力</span>の位置から来たかを、
			カーネルの <code class="text-[13px]">Emitter::lookup</code> と同じ規則（最大下界）で引きます。出力と写像点は
			<code class="text-[13px]">{data.counter.fixture}</code> を rsvelte で実際にコンパイルしたもので、写像点はまだ
			{data.counter.mappings.length} 個しかありません。写像点のない文字は、直前の写像点に吸い寄せられます。
		</p>
	</section>

	<section class="mt-28 grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-8 lg:grid-cols-12" aria-labelledby="one-kernel">
		<div class="lg:col-span-4">
			<h2 id="one-kernel" class="text-[28px] leading-[1.35] font-semibold">カーネルは言語を知らない</h2>
			<p class="mt-4 text-[16px] leading-[1.85] text-fg-2">
				<code class="text-[14px]">rsv_kernel</code> が持つのは、位置、名前、一度だけ計算するキャッシュ、スケジューラ、診断、
				レイアウト、出力と写像、計測です。Svelte について知っていることはひとつもありません。Svelte
				は言語プラグインとして、自分の言語・アーティファクト・タスクを登録します。
			</p>
			<p class="mt-4 text-[16px] leading-[1.85] text-fg-2">
				行数はビルド時に数えています。この図を描き直さなくても、コードが変われば数字も変わります。
			</p>
			<a href="/learn/kernel" class="link mt-4 inline-block text-[15px]">01 カーネルの全体像 →</a>
		</div>
		<div class="lg:col-span-8">
			<CrateDiagram crates={data.crates} />
		</div>
	</section>

	<section class="mt-28" aria-labelledby="ledger">
		<div class="grid grid-cols-[minmax(0,1fr)] gap-x-12 lg:grid-cols-12">
			<div class="lg:col-span-4">
				<h2 id="ledger" class="text-[28px] leading-[1.35] font-semibold">上流との一致</h2>
				<p class="mt-4 text-[16px] leading-[1.85] text-fg-2">
					正しさは上流のツールの出力と比べて測ります。手書きのユニットはほぼ揃っていますが、実際のコンポーネントを集めたコーパスでは、
					コンパイル結果が上流と一致するのは出力できたうちの一部です。
				</p>
			</div>
			<div class="mt-8 min-w-0 lg:col-span-8 lg:mt-0">
				<div class="overflow-x-auto">
					<table class="table">
						<caption class="mb-2 text-left font-mono text-[12px] tracking-normal text-muted">
							{data.units.population}
						</caption>
						<thead><tr><th>タスク</th><th>オラクル</th><th class="num">一致</th></tr></thead>
						<tbody>
							{#each data.units.rows as r (r.task)}
								<tr>
									<td><code>{r.task}</code>{#if r.note}<div class="mt-0.5 text-[13px] text-muted">{r.note}</div>{/if}</td>
									<td class="text-fg-2">{r.oracle}</td>
									<td class="num">{r.result}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<div class="mt-10 overflow-x-auto">
					<table class="table">
						<caption class="mb-2 text-left font-mono text-[12px] tracking-normal text-muted">
							{data.corpus.population} · 測定 {data.corpus.rev}
						</caption>
						<thead><tr><th>量</th><th class="num">ユニット</th><th class="num">割合</th></tr></thead>
						<tbody>
							<tr><td>JS を出力した</td><td class="num">{fmt(data.corpus.emitted)}</td><td class="num">{((data.corpus.emitted / data.corpus.units) * 100).toFixed(1)}%</td></tr>
							<tr><td class="pl-4">上流と一致</td><td class="num">{fmt(data.corpus.matched)}</td><td class="num">{((data.corpus.matched / data.corpus.emitted) * 100).toFixed(1)}%</td></tr>
							<tr><td class="pl-4">不一致</td><td class="num">{fmt(data.corpus.mismatched)}</td><td class="num">{((data.corpus.mismatched / data.corpus.emitted) * 100).toFixed(1)}%</td></tr>
							<tr>
								<td class="pl-4">パースできない JS を出した<div class="mt-0.5 text-[13px] text-muted">拒否すべきところで出力している欠陥</div></td>
								<td class="num text-warn">{fmt(data.corpus.unparseable)}</td>
								<td class="num text-warn">{((data.corpus.unparseable / data.corpus.emitted) * 100).toFixed(1)}%</td>
							</tr>
							<tr><td>未対応として拒否</td><td class="num">{fmt(data.corpus.missing)}</td><td class="num">{((data.corpus.missing / data.corpus.units) * 100).toFixed(1)}%</td></tr>
						</tbody>
					</table>
					<p class="mt-2 text-[13px] text-muted">出典: {data.corpus.source}。「一致」の割合は JS を出力したユニットに対するもの。</p>
				</div>
			</div>
		</div>
	</section>

	<section class="mt-28 grid grid-cols-[minmax(0,1fr)] gap-x-12 lg:grid-cols-12" aria-labelledby="perf">
		<div class="lg:col-span-4">
			<h2 id="perf" class="text-[28px] leading-[1.35] font-semibold">仕組みごとに測る</h2>
			<p class="mt-4 text-[16px] leading-[1.85] text-fg-2">
				ベンチマークの各アームは、同じ文書・同じタスクを、仕組みをひとつだけ変えて走らせます。アームの差が、その仕組みの効果です。
				ストリーミングは時間をほとんど変えずに、生存ヒープのピーク増分を {mb(arm('shared').peak)} MB から {mb(arm('streaming').peak)} MB にします。
			</p>
			<a href="/learn/measure" class="link mt-4 inline-block text-[15px]">13 実測 →</a>
		</div>
		<div class="mt-8 min-w-0 lg:col-span-8 lg:mt-0">
			<div class="overflow-x-auto">
				<table class="table min-w-[560px]">
					<thead>
						<tr><th>アーム</th><th class="w-[45%]">中央値</th><th class="num">ms</th><th class="num">ピーク増分</th></tr>
					</thead>
					<tbody>
						{#each data.bench.arms as a (a.name)}
							<tr>
								<td><code>{a.name}</code><div class="text-[13px] text-muted">{armNote[a.name]}</div></td>
								<td class="align-middle">
									<div class="h-2 bg-surface">
										<div
											class={['h-2', a.name === 'shared' ? 'bg-fg' : 'bg-line-strong']}
											style:width="{(a.median / maxMs) * 100}%"
										></div>
									</div>
								</td>
								<td class="num">{a.median.toFixed(1)}</td>
								<td class="num">{(a.peak / 1e6).toFixed(1)} MB</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<p class="mt-3 text-[13px] leading-[1.7] text-muted">
				{fmt(data.bench.documents)} 文書（{(data.bench.bytes / 1e6).toFixed(1)} MB）、4 タスク、{data.bench.threads} スレッド、release、{data.bench.rounds}
				ラウンドの中央値（ABBA 順）。時間は metrics なしのビルド、ピーク増分は metrics ありのビルドの別ラウンド。build
				{data.bench.rev.slice(0, 10)}。
			</p>
		</div>
	</section>

	<section class="mt-28" aria-labelledby="learn">
		<div class="grid grid-cols-[minmax(0,1fr)] gap-x-12 lg:grid-cols-12">
			<div class="lg:col-span-4">
				<h2 id="learn" class="text-[28px] leading-[1.35] font-semibold">Learn</h2>
				<p class="mt-4 text-[16px] leading-[1.85] text-fg-2">
					カーネルを大枠から細部まで読むための教材です。抜粋はすべてビルド時に実際のソースから切り出していて、行番号はファイルのものです。
				</p>
			</div>
			<ol class="mt-8 lg:col-span-8 lg:mt-0">
				{#each chapters as c (c.slug)}
					<li class="border-b border-line first:border-t">
						<a href={c.href} class="group grid grid-cols-[3rem_minmax(0,1fr)_auto] items-baseline gap-x-4 py-3">
							<span class="font-mono text-[13px] tracking-normal text-muted">{c.number}</span>
							<span>
								<span class="block text-[16px] group-hover:text-accent">{c.title}</span>
								<span class="mt-0.5 block text-[14px] leading-[1.6] text-muted">{c.abstract}</span>
							</span>
							<span class="font-mono text-[12px] tracking-normal text-muted tnum">{c.minutes} 分</span>
						</a>
					</li>
				{/each}
			</ol>
		</div>
	</section>
</main>
