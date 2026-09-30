<script lang="ts">
	import CrateDiagram from '$lib/components/CrateDiagram.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { REPO_URL, chapters } from '$lib/site';
	import SpanFigure from '$lib/widgets/SpanFigure.svelte';

	let { data } = $props();

	const fmt = (n: number) => n.toLocaleString('en-US');
	const mb = (b: number) => (b / 1e6).toFixed(1);
	const pct = (a: number, b: number) => ((a / b) * 100).toFixed(1);
	const sum = (v: Record<string, number>) => Object.values(v).reduce((a, b) => a + b, 0);
	const VERDICTS = [
		{ key: 'match', label: '一致', dot: 'bg-ok' },
		{ key: 'mismatch', label: '不一致', dot: 'bg-line-strong' },
		{ key: 'unparseable', label: 'パースできない出力', dot: 'bg-warn' },
		{ key: 'unexpected', label: '上流にない出力', dot: 'bg-accent' },
		{ key: 'missing', label: '未対応として拒否', dot: 'bg-fg-2/25' }
	];
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

	// Every figure in the hero is a ratio of two arms from the same bench run; nothing here is typed in.
	const stats = $derived([
		{
			value: `${arm('shared').median.toFixed(1)}`,
			unit: 'ms',
			label: `${fmt(data.bench.documents)} 文書・${mb(data.bench.bytes)} MB に 4 タスク`,
			detail: `${data.bench.threads} スレッド、${data.bench.rounds} ラウンドの中央値`
		},
		{
			value: `${(arm('isolated').median / arm('shared').median).toFixed(1)}`,
			unit: '×',
			label: 'パースを共有した効果',
			detail: `タスクごとに計算し直すと ${arm('isolated').median.toFixed(0)} ms`
		},
		{
			value: `${(arm('serial').median / arm('shared').median).toFixed(1)}`,
			unit: '×',
			label: '文書単位の並列化',
			detail: `1 スレッドでは ${arm('serial').median.toFixed(0)} ms`
		},
		{
			value: `${mb(arm('streaming').peak)}`,
			unit: 'MB',
			label: 'ストリーミング時のピーク増分',
			detail: `溜め込むと ${mb(arm('shared').peak)} MB`
		}
	]);

	const groups = $derived.by(() => {
		const first = chapters.findIndex((c) => c.module);
		const last = chapters.findLastIndex((c) => c.module);
		if (first < 0) return [{ title: '章', items: chapters }];
		return [
			{ title: 'はじめに', items: chapters.slice(0, first) },
			{ title: 'カーネルのモジュール', items: chapters.slice(first, last + 1) },
			{ title: '測って磨く', items: chapters.slice(last + 1) }
		].filter((g) => g.items.length > 0);
	});
	const totalMinutes = chapters.reduce((n, c) => n + c.minutes, 0);

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

<main>
	<section class="relative overflow-hidden border-b border-line">
		<div class="hero-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
		<div class="relative mx-auto max-w-[1440px] px-4 pt-12 pb-14 md:px-8 md:pt-20 md:pb-20">
			<a
				href="/learn/kernel"
				class="inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-raised py-1 pr-3 pl-1 text-[13px] text-fg-2 hover:border-line-strong hover:text-fg"
			>
				<span class="shrink-0 rounded-full bg-accent-wash px-2 py-0.5 font-mono text-[11px] tracking-normal text-accent">experimental</span>
				Rust で書いた Svelte 5 のツールチェーン
				<Icon name="arrow-right" size={13} class="text-muted" />
			</a>
			<h1
				class="mt-7 max-w-[15em] text-[36px] leading-[1.22] font-semibold tracking-[0.005em] sm:text-[clamp(44px,5.4vw,72px)] sm:leading-[1.14]"
				style="font-stretch: 88%"
			>
				Svelte のツールチェーンを、<br class="hidden sm:inline" /><span class="text-accent">ひとつのカーネル</span>で。
			</h1>
			<div class="mt-8 grid grid-cols-[minmax(0,1fr)] gap-x-16 gap-y-12 lg:grid-cols-12">
				<div class="lg:col-span-6">
					<p class="max-w-[36em] text-[17px] leading-[1.9] text-fg-2 sm:text-[19px]">
						コンパイル、整形、lint、型検査を、同じパースと同じ解析の上で走らせます。文書ごとに一度だけパースし、移植していない構文は近似せずに「未対応」と報告します。どこで時間とメモリを使ったかは、カーネル自身が数えます。
					</p>
					<div class="mt-9 flex flex-wrap items-center gap-3 text-[15px]">
						<a
							href="/learn"
							class="inline-flex h-11 items-center gap-2 rounded-md bg-fg px-5 font-medium text-bg shadow-sm hover:bg-accent"
							>カーネルを学ぶ<Icon name="arrow-right" size={15} /></a
						>
						<a
							href="/learn/playground"
							class="inline-flex h-11 items-center rounded-md border border-line bg-raised px-5 text-fg hover:border-line-strong"
							>Doc プレイグラウンド</a
						>
						<a
							href={REPO_URL}
							rel="noopener"
							class="inline-flex h-11 items-center gap-2 rounded-md px-3 text-fg-2 hover:text-fg"
							><Icon name="github" size={17} />GitHub</a
						>
					</div>
					<div
						class="mt-8 flex max-w-[640px] items-center gap-2 rounded-md border border-line bg-sunken py-1.5 pr-1.5 pl-3 font-mono text-[13px]"
					>
						<span class="text-muted select-none" aria-hidden="true">$</span>
						<code class="no-scrollbar min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-fg-2" title={cmd}>{cmd}</code>
						<button
							type="button"
							class="flex size-8 shrink-0 items-center justify-center rounded-sm text-muted hover:bg-surface hover:text-fg"
							onclick={copy}
							aria-label={copied ? 'コピーしました' : 'コマンドをコピー'}
						>
							{#if copied}<Icon name="check" size={15} class="text-ok" />{:else}<Icon name="copy" size={15} />{/if}
						</button>
					</div>
				</div>
				<div class="lg:col-span-6 lg:pt-1">
					<dl class="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line shadow-[0_1px_2px_#0000000a]">
						{#each stats as s (s.label)}
							<div class="flex flex-col bg-bg px-4 py-5 sm:px-6 sm:py-6">
								<dt class="order-2 mt-2 text-[14px] leading-[1.5] text-fg">{s.label}</dt>
								<dd class="order-1 flex items-baseline gap-1 font-mono tracking-tight tnum">
									<span class="text-[32px] leading-none font-medium sm:text-[40px]">{s.value}</span>
									<span class="text-[16px] text-muted sm:text-[18px]">{s.unit}</span>
								</dd>
								<dd class="order-3 mt-1 text-[12.5px] leading-[1.5] text-muted">{s.detail}</dd>
							</div>
						{/each}
					</dl>
					<p class="mt-3 font-mono text-[11.5px] tracking-normal text-muted">
						release ビルド {data.bench.rev.slice(0, 10)} の実測。アームの定義と再現手順は <a class="link" href="/learn/measure"
							>13 実測</a
						>に。
					</p>
				</div>
			</div>
		</div>
	</section>

	<div class="mx-auto max-w-[1440px] px-4 md:px-8">
		<section class="pt-20" aria-labelledby="hero-fig">
			<div class="grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-4 lg:grid-cols-12 lg:items-end">
				<div class="lg:col-span-5">
					<p class="eyebrow">動く図</p>
					<h2 id="hero-fig" class="mt-2 text-[26px] leading-[1.4] font-semibold sm:text-[30px]">出力の位置から、入力の位置へ</h2>
				</div>
				<p class="text-[16px] leading-[1.9] text-fg-2 lg:col-span-7">
					<span class="c-gen">出力</span>の上でカーソルを動かすと、その文字がどの<span class="c-src">入力</span
					>の位置から来たかを、カーネルの <code class="text-[14px]">Emitter::lookup</code> と同じ規則（最大下界）で引きます。
				</p>
			</div>
			<div class="mt-8">
				<SpanFigure data={data.counter} label="図 0 · 出力の位置から入力の位置へ" />
			</div>
			<p class="mt-3 max-w-[52em] text-[13.5px] leading-[1.8] text-muted">
				出力と写像点は <code class="text-[12.5px]">{data.counter.fixture}</code> を rsvelte で実際にコンパイルしたもので、写像点はまだ
				{data.counter.mappings.length} 個しかありません。写像点のない文字は、直前の写像点に吸い寄せられます。
			</p>
		</section>

		<section class="mt-28 grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-8 lg:grid-cols-12" aria-labelledby="one-kernel">
			<div class="lg:col-span-4">
				<p class="eyebrow">設計</p>
				<h2 id="one-kernel" class="mt-2 text-[26px] leading-[1.4] font-semibold sm:text-[30px]">カーネルは言語を知らない</h2>
				<p class="mt-4 text-[16px] leading-[1.9] text-fg-2">
					<code class="text-[14px]">rsv_kernel</code> が持つのは、位置、名前、一度だけ計算するキャッシュ、スケジューラ、診断、レイアウト、出力と写像、計測です。Svelte について知っていることはひとつもありません。Svelte
					は言語プラグインとして、自分の言語・アーティファクト・タスクを登録します。
				</p>
				<p class="mt-4 text-[14px] leading-[1.8] text-muted">
					行数はビルド時に数えています。この図を描き直さなくても、コードが変われば数字も変わります。
				</p>
				<a href="/learn/kernel" class="mt-5 inline-flex items-center gap-1.5 text-[15px] font-medium text-accent hover:underline"
					>01 カーネルの全体像<Icon name="arrow-right" size={14} /></a
				>
			</div>
			<div class="rounded-lg border border-line bg-sunken p-4 sm:p-6 lg:col-span-8">
				<CrateDiagram crates={data.crates} />
			</div>
		</section>

		<section class="mt-28" aria-labelledby="ledger">
			<div class="grid grid-cols-[minmax(0,1fr)] gap-x-12 lg:grid-cols-12">
				<div class="lg:col-span-4">
					<p class="eyebrow">正しさ</p>
					<h2 id="ledger" class="mt-2 text-[26px] leading-[1.4] font-semibold sm:text-[30px]">上流との一致</h2>
					<p class="mt-4 text-[16px] leading-[1.9] text-fg-2">
						正しさは上流のツールの出力と比べて測ります。手書きのユニットはほぼ揃っていますが、実際のコンポーネントを集めたコーパスでは、コンパイル結果が上流と一致するのは出力できたうちの一部です。
					</p>
				</div>
				<div class="mt-8 min-w-0 lg:col-span-8 lg:mt-0">
					<ul class="flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-fg-2">
						{#each VERDICTS as v (v.key)}
							<li class="flex items-center gap-1.5"><span class={['size-2 rounded-full', v.dot]}></span>{v.label}</li>
						{/each}
					</ul>
					<div class="mt-4 overflow-x-auto">
						<table class="table">
							<caption class="mb-2 text-left font-mono text-[12px] tracking-normal text-muted">
								fixtures/_registry/parity.json · {fmt(data.parity.units)} ユニット · ビルド時に集計
							</caption>
							<thead><tr><th>タスク</th><th class="w-[40%]">判定の内訳</th><th class="num">一致</th></tr></thead>
							<tbody>
								{#each data.parity.rows as r (r.task)}
									{@const total = sum(r.verdicts)}
									<tr>
										<td><code>{r.task}</code></td>
										<td>
											<div
												class="flex h-2.5 overflow-hidden rounded-full bg-surface"
												role="img"
												aria-label={VERDICTS.filter((v) => r.verdicts[v.key])
													.map((v) => `${v.label} ${r.verdicts[v.key]}`)
													.join('、')}
											>
												{#each VERDICTS as v (v.key)}
													{#if r.verdicts[v.key]}
														<span class={v.dot} style:width="{pct(r.verdicts[v.key] ?? 0, total)}%"></span>
													{/if}
												{/each}
											</div>
										</td>
										<td class="num font-mono text-[14px]">{fmt(r.verdicts.match ?? 0)} / {fmt(total)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					<p class="mt-3 text-[13px] leading-[1.8] text-muted">
						手書きのユニットと、コーパスから取り込んだユニットを、上流のツールの出力と比べた判定です。CI はこのファイルをラチェットとして扱い、判定が一つでも動けば落ちます（<a
							class="link"
							href="/learn/measure">13 実測</a
						>）。「未対応」はまだ移植していない構文を正直に拒否したもの、「パースできない」は拒否すべきところで出力してしまった欠陥です。
					</p>
				</div>
			</div>
		</section>

		<section class="mt-28 grid grid-cols-[minmax(0,1fr)] gap-x-12 lg:grid-cols-12" aria-labelledby="perf">
			<div class="lg:col-span-4">
				<p class="eyebrow">性能</p>
				<h2 id="perf" class="mt-2 text-[26px] leading-[1.4] font-semibold sm:text-[30px]">仕組みごとに測る</h2>
				<p class="mt-4 text-[16px] leading-[1.9] text-fg-2">
					ベンチマークの各アームは、同じ文書・同じタスクを、仕組みをひとつだけ変えて走らせます。アームの差が、その仕組みの効果です。ストリーミングは時間をほとんど変えずに、生存ヒープのピーク増分を {mb(arm('shared').peak)} MB から {mb(arm('streaming').peak)} MB にします。
				</p>
				<a href="/learn/measure" class="mt-5 inline-flex items-center gap-1.5 text-[15px] font-medium text-accent hover:underline"
					>13 実測<Icon name="arrow-right" size={14} /></a
				>
			</div>
			<div class="mt-8 min-w-0 lg:col-span-8 lg:mt-0">
				<div class="overflow-x-auto">
					<table class="table min-w-[560px]">
						<thead>
							<tr><th>アーム</th><th class="w-[42%]">中央値</th><th class="num">ms</th><th class="num">ピーク増分</th></tr>
						</thead>
						<tbody>
							{#each data.bench.arms as a (a.name)}
								<tr>
									<td><code>{a.name}</code><div class="text-[13px] text-muted">{armNote[a.name]}</div></td>
									<td class="align-middle">
										<div class="h-2.5 overflow-hidden rounded-full bg-surface">
											<div
												class={['h-full rounded-full', a.name === 'shared' ? 'bg-accent' : 'bg-line-strong']}
												style:width="{(a.median / maxMs) * 100}%"
											></div>
										</div>
									</td>
									<td class="num">{a.median.toFixed(1)}</td>
									<td class="num">{mb(a.peak)} MB</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<p class="mt-3 text-[13px] leading-[1.7] text-muted">
					{fmt(data.bench.documents)} 文書（{mb(data.bench.bytes)} MB）、4 タスク、{data.bench.threads} スレッド、release、{data.bench.rounds}
					ラウンドの中央値（ABBA 順）。時間は metrics なしのビルド、ピーク増分は metrics ありのビルドの別ラウンド。build
					{data.bench.rev.slice(0, 10)}。
				</p>
			</div>
		</section>

		<section class="mt-28" aria-labelledby="learn">
			<div class="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p class="eyebrow">Learn</p>
					<h2 id="learn" class="mt-2 text-[26px] leading-[1.4] font-semibold sm:text-[30px]">カーネルを読む {chapters.length} 章</h2>
					<p class="mt-3 max-w-[42em] text-[16px] leading-[1.9] text-fg-2">
						大枠から細部まで読むための教材です。抜粋はすべてビルド時に実際のソースから切り出していて、行番号はファイルのものです。通して約
						{totalMinutes} 分。
					</p>
				</div>
			</div>
			<div class="mt-10 space-y-10">
				{#each groups as g (g.title)}
					<div>
						<p class="eyebrow mb-3">{g.title}</p>
						<ol class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{#each g.items as c (c.slug)}
								<li>
									<a
										href={c.href}
										class="group flex h-full flex-col rounded-lg border border-line bg-bg p-4 hover:border-line-strong hover:bg-sunken"
									>
										<span class="flex items-center justify-between font-mono text-[12px] tracking-normal text-muted tnum">
											<span class="rounded-sm bg-surface px-1.5 py-0.5 text-fg-2 group-hover:text-accent">{c.number}</span>
											<span>{c.minutes} 分</span>
										</span>
										<span class="mt-3 text-[16px] leading-[1.5] font-medium text-fg group-hover:text-accent">{c.title}</span>
										<span class="mt-1.5 text-[13.5px] leading-[1.7] text-muted">{c.abstract}</span>
									</a>
								</li>
							{/each}
						</ol>
					</div>
				{/each}
			</div>
		</section>
	</div>
</main>

<style>
	.hero-grid {
		background-image:
			linear-gradient(to right, var(--border) 1px, transparent 1px),
			linear-gradient(to bottom, var(--border) 1px, transparent 1px);
		background-size: 48px 48px;
		mask-image: radial-gradient(ellipse 70% 80% at 80% 0%, #000 0%, transparent 70%);
		opacity: 0.55;
	}
</style>
