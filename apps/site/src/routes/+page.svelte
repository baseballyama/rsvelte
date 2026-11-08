<script lang="ts">
	import CrateDiagram from '#lib/components/CrateDiagram.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { REPO_URL, chapters } from '#lib/site.ts';
	import SpanFigure from '#lib/widgets/SpanFigure.svelte';

	let { data } = $props();

	const fmt = (n: number) => n.toLocaleString('en-US');
	const mb = (b: number) => (b / 1e6).toFixed(1);
	const pct = (a: number, b: number) => ((a / b) * 100).toFixed(1);
	const sum = (v: Record<string, number>) => Object.values(v).reduce((a, b) => a + b, 0);
	const VERDICTS = [
		{ key: 'match', label: '一致', dot: 'bg-ok' },
		{ key: 'mismatch', label: '不一致', dot: 'bg-line-strong' },
		{ key: 'unparseable', label: 'JavaScript として解析できない出力', dot: 'bg-warn' },
		{ key: 'unexpected', label: 'rsvelte だけが出力', dot: 'bg-accent' },
		{ key: 'missing', label: '公式ツールだけが出力', dot: 'bg-fg-2/25' },
	];
	const arm = (name: string) => {
		const a = data.benchmark.arms.find((x) => x.name === name);
		if (!a) throw new Error(`no arm ${name}`);
		return a;
	};
	const maxMs = $derived(Math.max(...data.benchmark.arms.map((a) => a.median)));
	const armNote: Record<string, string> = {
		shared: 'ファイル内の処理が計算結果を共有',
		isolated: '処理ごとに計算し直す',
		nopool: '作業用メモリを再利用しない',
		serial: '1 スレッド',
		streaming: '確定した結果から順に捨てる',
	};

	// Every figure in the hero is a ratio of two arms from the same benchmark run; nothing here is typed in.
	const stats = $derived([
		{
			value: `${arm('shared').median.toFixed(1)}`,
			unit: 'ms',
			label: `${fmt(data.benchmark.documents)} ファイル（${mb(data.benchmark.bytes)} メガバイト）に ${data.benchmark.tasks} 種類の処理をかける 1 ラウンドの時間`,
			detail: `${data.benchmark.threads} スレッド、${data.benchmark.rounds} ラウンドの中央値`,
		},
		{
			value: `${(arm('isolated').median / arm('shared').median).toFixed(1)}`,
			unit: '×',
			label: '構文解析の結果を共有した効果',
			detail: `処理ごとに計算し直すと ${arm('isolated').median.toFixed(0)} ms`,
		},
		{
			value: `${(arm('serial').median / arm('shared').median).toFixed(1)}`,
			unit: '×',
			label: 'ファイルごとの並列実行',
			detail: `1 スレッドでは ${arm('serial').median.toFixed(0)} ms`,
		},
		{
			value: `${mb(arm('streaming').peak)}`,
			unit: 'メガバイト',
			label: '確定した結果から順に捨てたときのメモリ増加の最大値',
			detail: `結果をすべて保持すると ${mb(arm('shared').peak)} メガバイト`,
		},
	]);

	const groups = $derived.by(() => {
		const first = chapters.findIndex((c) => c.module);
		const last = chapters.findLastIndex((c) => c.module);
		if (first < 0) return [{ title: '章', items: chapters }];
		return [
			{ title: 'はじめに', items: chapters.slice(0, first) },
			{ title: 'モジュールごとの解説', items: chapters.slice(first, last + 1) },
			{ title: '計測・改善・拡張', items: chapters.slice(last + 1) },
		].filter((g) => g.items.length > 0);
	});
	const totalMinutes = chapters.reduce((n, c) => n + c.minutes, 0);

	const command =
		'cargo run --release -p rsvelte_command_line -- run Counter.svelte --task svelte.compile/client';
	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(command);
		copied = true;
		setTimeout(() => (copied = false), 1200);
	}
</script>

<svelte:head>
	<title>rsvelte — Rust で書いた Svelte 5 のツールチェーン</title>
	<meta
		name="description"
		content="rsvelte は、Svelte 5 のコンパイル・整形・コード検査・型検査を Rust で実装した実験的なツールチェーンです。ソースを一度だけ構文解析し、その結果をすべての処理で使います。"
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
				<span
					class="shrink-0 rounded-full bg-accent-wash px-2 py-0.5 font-mono text-[11px] tracking-normal text-accent"
					>experimental</span
				>
				設計の全体像（1 章）
				<Icon name="arrow-right" size={13} class="text-muted" />
			</a>
			<h1
				class="mt-7 max-w-[15em] text-[36px] leading-[1.22] font-semibold tracking-[0.005em] sm:text-[clamp(44px,5.4vw,72px)] sm:leading-[1.14]"
				style="font-stretch: 88%"
			>
				Svelte 5 の 4 つのツールが、<br class="hidden sm:inline" /><span class="text-accent"
					>同じ構文木</span
				>を使う
			</h1>
			<div class="mt-8 grid grid-cols-[minmax(0,1fr)] gap-x-16 gap-y-12 lg:grid-cols-12">
				<div class="lg:col-span-6">
					<p class="max-w-[36em] text-[17px] leading-[1.9] text-fg-2 sm:text-[19px]">
						rsvelte は、Svelte 5 のコンパイル、整形、コード検査、型検査を Rust
						で書いた実験的なツールチェーンです。Svelte
						のソースはファイルごとに一度だけ構文解析し、その結果を 4
						つの処理で共有します。まだ対応していない構文は、近似せずに未対応として報告します。
					</p>
					<p class="mt-4 max-w-[36em] text-[15px] leading-[1.9] text-fg-2">
						今は試す段階です。ブラウザの<a class="link" href="/learn/playground">プレイグラウンド</a
						>か、ソースからビルドしたコマンドで動かせます。配布用のパッケージはまだありません。実際のコードには未対応の構文があり、公式ツールの代わりに本番で使える段階ではありません。
					</p>
					<ul class="mt-9 flex flex-wrap items-center gap-3 text-[15px]">
						<li>
							<a
								href="/guide"
								class="inline-flex h-11 items-center gap-2 rounded-md bg-fg px-5 font-medium text-bg shadow-sm hover:bg-accent"
								>使い方ガイド<Icon name="arrow-right" size={15} /></a
							>
						</li>
						<li>
							<a
								href="/why"
								class="inline-flex h-11 items-center gap-2 rounded-md border border-line bg-raised px-5 font-medium text-fg hover:border-line-strong"
								>rsvelte を作る理由<Icon name="arrow-right" size={15} /></a
							>
						</li>
						<li>
							<a
								href="/learn"
								class="inline-flex h-11 items-center gap-2 rounded-md border border-line bg-raised px-5 font-medium text-fg hover:border-line-strong"
								>開発者向けの教材<Icon name="arrow-right" size={15} /></a
							>
						</li>
						<li>
							<a
								href="/learn/playground"
								class="inline-flex h-11 items-center rounded-md border border-line bg-raised px-5 text-fg hover:border-line-strong"
								>プレイグラウンド</a
							>
						</li>
						<li>
							<a
								href={REPO_URL}
								rel="noopener"
								class="inline-flex h-11 items-center gap-2 rounded-md px-3 text-fg-2 hover:text-fg"
								><Icon name="github" size={17} />GitHub</a
							>
						</li>
					</ul>
					<div
						class="mt-8 flex max-w-[640px] items-center gap-2 rounded-md border border-line bg-sunken py-1.5 pr-1.5 pl-3 font-mono text-[13px]"
					>
						<span class="text-muted select-none" aria-hidden="true">$</span>
						<code
							class="no-scrollbar min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-fg-2"
							title={command}>{command}</code
						>
						<button
							type="button"
							class="flex size-8 shrink-0 items-center justify-center rounded-sm text-muted hover:bg-surface hover:text-fg"
							onclick={copy}
							aria-label={copied ? 'コピーしました' : 'コマンドをコピー'}
						>
							{#if copied}<Icon name="check" size={15} class="text-ok" />{:else}<Icon
									name="copy"
									size={15}
								/>{/if}
						</button>
					</div>
				</div>
				<div class="lg:col-span-6 lg:pt-1">
					<dl
						class="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line shadow-[0_1px_2px_#0000000a]"
					>
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
						倍率はどちらも rsvelte 自身の測定条件どうしの比で、公式ツールとの比較ではありません。1
						ラウンドは全ファイルを 1
						回処理することで、ファイルの読み込みは含みません。測定条件の定義と再現手順は<a
							class="link"
							href="/learn/measure">第 14 章「実測」</a
						>にあります。
					</p>
				</div>
			</div>
		</div>
	</section>

	<div class="mx-auto max-w-[1440px] px-4 md:px-8">
		<section class="pt-20" aria-labelledby="hero-fig">
			<div class="grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-4 lg:grid-cols-12 lg:items-end">
				<div class="lg:col-span-5">
					<p class="eyebrow">位置の対応</p>
					<h2 id="hero-fig" class="mt-2 text-[26px] leading-[1.4] font-semibold sm:text-[30px]">
						出力の文字が、入力のどこから来たか
					</h2>
				</div>
				<p class="text-[16px] leading-[1.9] text-fg-2 lg:col-span-7">
					<span class="c-gen">出力</span>の上でカーソルを動かすと、その文字が<span class="c-src"
						>入力</span
					>のどの位置から来たかを表示します。rsvelte
					はコンパイルのときに、出力と入力の位置を結ぶ対応点を記録します。対応点のない文字には、それより前で最も近い対応点を使います。
				</p>
			</div>
			<div class="mt-8">
				<SpanFigure data={data.counter} label="図 0 · 出力の文字と入力の位置の対応" />
			</div>
			<p class="mt-3 max-w-[52em] text-[13.5px] leading-[1.8] text-muted">
				図の出力と対応点は、<code class="text-[12.5px]">{data.counter.fixture}</code> を rsvelte
				で実際にコンパイルしたものです。今のコンパイラが記録する対応点はこのファイルで {data.counter
					.mappings.length}
				個だけなので、多くの文字が直前の対応点にまとめて対応します。対応の引き方は、カーネル（言語を知らない共通部分）の
				<code class="text-[12.5px]">Emitter::lookup</code> と同じです。
			</p>
		</section>

		<section
			class="mt-28 grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-8 lg:grid-cols-12"
			aria-labelledby="one-kernel"
		>
			<div class="lg:col-span-4">
				<p class="eyebrow">設計</p>
				<h2 id="one-kernel" class="mt-2 text-[26px] leading-[1.4] font-semibold sm:text-[30px]">
					カーネルは言語を知らない
				</h2>
				<p class="mt-4 text-[16px] leading-[1.9] text-fg-2">
					<code class="text-[14px]">rsvelte_kernel</code>
					が受け持つのは、ソース内の位置、名前の保存、一度だけ計算するキャッシュ、並列実行、診断、出力と位置の対応、計測です。Svelte
					への対応は、言語プラグインとしてカーネルに処理を登録します。<code class="text-[14px]"
						>rsvelte_svelte</code
					>
					は構文解析や名前解決の計算結果を登録します。コンパイル・整形・コード検査・型検査の crate は、それぞれのタスク（処理の単位）を登録します。
				</p>
				<p class="mt-4 text-[14px] leading-[1.8] text-muted">
					図の数字は各 crate の Rust
					のコードの行数（テストを含む）で、ビルドのたびに数えます。図は主な crate
					の抜粋で、破線は図にない crate を通した間接の依存です。すべての crate の役割は、第 1
					章「カーネルの全体像」の図 1.2 にあります。
				</p>
				<a
					href="/learn/kernel"
					class="mt-5 inline-flex items-center gap-1.5 text-[15px] font-medium text-accent hover:underline"
					>第 1 章「カーネルの全体像」<Icon name="arrow-right" size={14} /></a
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
					<h2 id="ledger" class="mt-2 text-[26px] leading-[1.4] font-semibold sm:text-[30px]">
						公式ツールとの一致
					</h2>
					<p class="mt-4 text-[16px] leading-[1.9] text-fg-2">
						rsvelte の出力を、公式ツール（公式の Svelte
						コンパイラなど）の出力と比べます。入力は検証用のソースファイル集で、公開リポジトリから集めた実在の
						Svelte
						ファイルです。今この表にあるのはコンパイルの判定だけで、整形・コード検査・型検査はまだ含みません。
					</p>
				</div>
				<div class="mt-8 min-w-0 lg:col-span-8 lg:mt-0">
					<ul class="flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-fg-2">
						{#each VERDICTS as v (v.key)}
							<li class="flex items-center gap-1.5">
								<span class={['size-2 rounded-full', v.dot]}></span>{v.label}
							</li>
						{/each}
					</ul>
					<div class="mt-4 overflow-x-auto">
						<table class="table">
							<caption class="mb-2 text-left font-mono text-[12px] tracking-normal text-muted">
								corpus/_registry/parity.json · {fmt(data.parity.units)} 件の判定 · ビルド時に集計
							</caption>
							<thead
								><tr><th>タスク</th><th class="w-[40%]">判定の内訳</th><th class="num">一致</th></tr
								></thead
							>
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
														<span class={v.dot} style:width="{pct(r.verdicts[v.key] ?? 0, total)}%"
														></span>
													{/if}
												{/each}
											</div>
										</td>
										<td class="num font-mono text-[14px]"
											>{fmt(r.verdicts.match ?? 0)}/{fmt(total)}</td
										>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					<p class="mt-3 text-[13px] leading-[1.8] text-muted">
						判定は 1 ファイル・1 タスクごとに一つです。<code>svelte.compile/client</code>
						はブラウザ向け、<code>/server</code> はサーバー向けのコンパイルです。<code
							>compileModule</code
						>
						は <code>.svelte.js</code> などのモジュールのコンパイルで、まだ実装していません。JavaScript
						は構文木として比べます。rsvelte が診断だけを返して出力しなかったファイルは数えません。
					</p>
					<p class="mt-2 text-[13px] leading-[1.8] text-muted">
						変更時の自動検査はこのファイルを基準値とし、判定が一つでも変わると失敗します。良くなった場合も失敗させ、意図した変化だけを人が記録し直します（<a
							class="link"
							href="/learn/measure">第 14 章「実測」</a
						>）。
					</p>
				</div>
			</div>
		</section>

		<section
			class="mt-28 grid grid-cols-[minmax(0,1fr)] gap-x-12 lg:grid-cols-12"
			aria-labelledby="performance"
		>
			<div class="lg:col-span-4">
				<p class="eyebrow">性能</p>
				<h2 id="performance" class="mt-2 text-[26px] leading-[1.4] font-semibold sm:text-[30px]">
					仕組みごとに測る
				</h2>
				<p class="mt-4 text-[16px] leading-[1.9] text-fg-2">
					ベンチマークでは、同じファイルに同じ処理を、仕組みを一つだけ変えて実行します。この変え方を測定条件と呼び、測定条件どうしの差をその仕組みの効果とみなします。測定条件はどれも
					rsvelte 自身の設定で、ほかのツールではありません。
				</p>
				<a
					href="/learn/measure"
					class="mt-5 inline-flex items-center gap-1.5 text-[15px] font-medium text-accent hover:underline"
					>第 14 章「実測」<Icon name="arrow-right" size={14} /></a
				>
			</div>
			<div class="mt-8 min-w-0 lg:col-span-8 lg:mt-0">
				<div class="overflow-x-auto">
					<table class="table min-w-[560px]">
						<thead>
							<tr
								><th>測定条件</th><th class="w-[42%]">中央値</th><th class="num">ms</th><th
									class="num">メモリ増加の最大値</th
								></tr
							>
						</thead>
						<tbody>
							{#each data.benchmark.arms as a (a.name)}
								<tr>
									<td
										><code>{a.name}</code>
										<div class="text-[13px] text-muted">{armNote[a.name]}</div></td
									>
									<td class="align-middle">
										<div class="h-2.5 overflow-hidden rounded-full bg-surface">
											<div
												class={[
													'h-full rounded-full',
													a.name === 'shared' ? 'bg-accent' : 'bg-line-strong',
												]}
												style:width="{(a.median / maxMs) * 100}%"
											></div>
										</div>
									</td>
									<td class="num">{a.median.toFixed(1)}</td>
									<td class="num">{mb(a.peak)} メガバイト</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<p class="mt-3 text-[13px] leading-[1.7] text-muted">
					時間は計測機能を外したビルドで、{data.benchmark.rounds}
					ラウンドの中央値です。メモリは計測機能を入れたビルドで測りました。どちらも同じコミット（<code
						>{data.benchmark.rev.slice(0, 10)}</code
					>）の同じ {fmt(data.benchmark.documents)} ファイルです。測定条件の実行順は、ラウンドごとに入れ替えています。
				</p>
			</div>
		</section>

		<section class="mt-28" aria-labelledby="learn">
			<div class="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p class="eyebrow">教材</p>
					<h2 id="learn" class="mt-2 text-[26px] leading-[1.4] font-semibold sm:text-[30px]">
						開発者向けの教材 {chapters.length} 章
					</h2>
					<p class="mt-3 max-w-[42em] text-[16px] leading-[1.9] text-fg-2">
						rsvelte
						の内部を、全体の構成から一行ずつのコードまで順に読む教材です。抜粋はビルド時に実際のソースから切り出し、行番号は元のファイルのものです。通して読むと約
						{totalMinutes} 分です。
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
										<span
											class="flex items-center justify-between font-mono text-[12px] tracking-normal text-muted tnum"
										>
											<span
												class="rounded-sm bg-surface px-1.5 py-0.5 text-fg-2 group-hover:text-accent"
												>{c.number}</span
											>
											<span>{c.minutes} 分</span>
										</span>
										<span
											class="mt-3 text-[16px] leading-[1.5] font-medium text-fg group-hover:text-accent"
											>{c.title}</span
										>
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
