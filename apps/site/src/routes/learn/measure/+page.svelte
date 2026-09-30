<script lang="ts">
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import DeepDive from '$lib/components/DeepDive.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';

	let { data } = $props();
	const c = chapter('measure');
	const fmt = (n: number) => n.toLocaleString('en-US');
	const mb = (b: number) => (b / 1e6).toFixed(1);
	const a = (name: string) => {
		const x = data.arms.find((y) => y.name === name);
		if (!x) throw new Error(`no arm ${name}`);
		return x;
	};
	const armDoc: Record<string, string> = {
		shared: '文書のタスクがアーティファクトを共有、pool あり、全スレッド',
		isolated: 'タスクごとに計算し直す',
		nopool: 'pool なし',
		serial: '1 スレッド',
		streaming: 'shared に加え、結果を確定した順に捨てる'
	};
	const totalSelf = $derived(data.phases.reduce((n, p) => n + p.self_ms, 0));
	const maxMs = $derived(Math.max(...data.arms.map((x) => x.plain[0])));
	const verdicts = ['match', 'mismatch', 'unparseable', 'unexpected', 'missing'];
	const perByte = (n: number) => (n / data.perf.population.source_bytes).toFixed(1);
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="性能は一度測って終わりではありません。rsvelte は、マシンの混み具合で揺れない量だけを数え、記録した値と比べる検査を、すべての push で走らせています。この章では、その仕組みと、各章で触れた壁時計のベンチマークの出どころを見ます。"
/>

<div class="prose-learn">
	<H2 id="ratchet" />
	<p>
		<dfn>ラチェット</dfn>は、記録した値からの変化を、向きを問わずすべて止める検査です。<code>tools/perf</code> は、コーパス全体を処理したときの割り当ての回数・バイト数・命令数を
		<code>tools/perf/baseline.json</code> と比べ、増えていれば CI を落とします。減っていても、基準値を書き換えていなければ落とします。改善は、それを入れた変更自身が基準値に書き込むことで固定されます。
	</p>
	<p>次の数は、このページをビルドしたときの <code>tools/perf/baseline.json</code> から読んでいます。</p>
</div>

<figure class="my-8 overflow-x-auto">
	<table class="table [&_td:first-child]:pr-6 [&_td:first-child]:whitespace-nowrap">
		<tbody>
			<tr><td>母集団</td><td class="num">{fmt(data.perf.population.documents)} 文書、{fmt(data.perf.population.source_bytes)} バイト</td></tr>
			<tr><td>タスク</td><td class="font-mono text-[13px]">{data.perf.population.tasks.join(' · ')}</td></tr>
			<tr><td>割り当て（最後の 1 ラウンド）</td><td class="num">{fmt(data.perf.allocs)} 回</td></tr>
			<tr><td>割り当てバイト</td><td class="num">{fmt(data.perf.allocBytes)}</td></tr>
			<tr><td>生存ヒープのピーク増分</td><td class="num">{fmt(data.perf.peak)}</td></tr>
			<tr
				><td>命令数、1 ラウンド（{data.perf.platform}）</td><td class="num"
					>{fmt(data.perf.instructions)}（入力 1 バイトあたり {perByte(data.perf.instructions)}）</td
				></tr
			>
			<tr
				><td>命令数、読み込み（{data.perf.platform}）</td><td class="num">{fmt(data.perf.load)}（入力 1 バイトあたり {perByte(data.perf.load)}）</td
				></tr
			>
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		最後にこの基準値を書き換えたコミットは <code>{data.perf.last.sha ?? "作業ツリー（未コミット）"}</code>（{data.perf.last.subject}）。記録の推移は <a class="link" href="/learn/polish#history"
			>14 磨きどころ</a
		> にあります。
	</figcaption>
</figure>

<div class="prose-learn">
	<H2 id="counters" />
	<p>数える量は三種類です。</p>
	<ul>
		<li>
			<strong>割り当て</strong>: <code>metrics</code> feature を入れたビルドの <code>rsv perf</code> が、<code>CountingAlloc</code>（<a
				href="/learn/kernel/metrics#alloc">11</a
			>）で最後のラウンドの割り当て回数とバイト数を数えます。全体の数に加え、フェーズ（アーティファクト、タスク、ルール）ごとの呼び出し回数・割り当て回数・バイト数、それに生存ヒープのピーク増分です。比べ方は<strong>完全一致</strong>です。
		</li>
		<li>
			<strong>命令数（1 ラウンド）</strong>: metrics なしの出荷用ビルドを cachegrind（valgrind）の下で走らせ、実行した命令の数（<code>I refs</code>）を数えます。<code
				>rounds=2</code
			>
			の実行から <code>rounds=1</code> の実行を引くので、ちょうど温まった 1 ラウンドの分になります。比べ方は <strong>±0.2%</strong> です。
		</li>
		<li>
			<strong>命令数（読み込み）</strong>: <code>rounds=0</code> の実行、つまり起動、ディレクトリの走査、ファイルの読み込み、文書の構築です。CLI
			を呼ぶたびに払う分なので、別に数えます。比べ方は同じく ±0.2% です。
		</li>
	</ul>
</div>

<Code item={data.code.perfDoc} />

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table min-w-[560px]">
		<thead><tr><th>フェーズ</th><th class="num">呼び出し</th><th class="num">割り当て</th><th class="num">バイト</th></tr></thead>
		<tbody>
			{#each data.perf.phases as p (p.name)}
				<tr>
					<td><code>{p.name}</code></td>
					<td class="num">{fmt(p.calls)}</td>
					<td class="num">{fmt(p.allocs)}</td>
					<td class="num">{fmt(p.alloc_bytes)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		基準値のフェーズ表。割り当て回数の多い順。割り当ては self（入れ子のフェーズを除いた分）です。
	</figcaption>
</figure>

<div class="prose-learn">
	<H2 id="determinism" />
	<p>ラチェットが厳密に比べられるのは、数える量が入力とバイナリだけで決まるように測り方を選んでいるからです。</p>
	<ul>
		<li>
			<strong>1 スレッドで走らせる。</strong>並列に走らせると、どの文書がどのスレッドのバッファプールに当たるかが実行ごとに変わり、割り当ての回数も変わります。1
			スレッドなら、割り当ての列は入力とバイナリの関数です。導入したコミットでは、コミット済みのコーパスを 2 回測った結果がバイト単位で一致しました（fa4072dfa3）。
		</li>
		<li>
			<strong>最後のラウンドだけを数える。</strong>最初のラウンドはバッファプールが空で、容量を伸ばす割り当てが混ざります。数えるのはプールが温まった最後のラウンドです。
		</li>
		<li>
			<strong>プラットフォームに依存する割り当てを消す。</strong><code>run</code> が文書ごとに <code>Mutex</code>
			を使っていたころは、macOS の mutex が最初のロックで割り当てを行うため、macOS と Linux で割り当て回数がちょうど文書の数だけ違っていました。ロックをなくしてから、二つのプラットフォームは同じ数を報告します（a5f67528cd、<a
				href="/learn/kernel/pipeline#run">06</a
			>）。
		</li>
		<li>
			<strong>ファイルシステムの順序に依存しない。</strong>CLI の読み込みは、各ディレクトリの項目を名前の順に深さ優先でたどります。どのファイルシステムでも、文書は同じ順に並びます（a5822ee26f）。
		</li>
		<li>
			<strong>時間ではなく命令を数える。</strong>命令数も同じマシンではほぼ同じ値を繰り返します。同じツリーを 2 回測った差は 1e-7 程度でした（a5f67528cd）。±0.2%
			の幅は、libc や CPU ごとの関数の選び分けの違いを吸収するためのものです。
		</li>
	</ul>
	<p>
		命令数は、基準値を記録したプラットフォーム（今は arm64 Linux）でだけ比べます。割り当ては、どのプラットフォームでも同じ数になるので、macOS
		の手元でも <code>mise run perf</code> で比べられます。命令数を数えない実行では、その欄は <code>UNMEASURED</code> と表示され、0 とは書きません。
	</p>

	<H2 id="ci" />
	<p>
		<code>.github/workflows/ci.yml</code> は、すべての push と pull request で三つのジョブを走らせます。
	</p>
	<ul>
		<li><code>rust</code>: 整形、二つの feature の組み合わせでの clippy、rustdoc、テスト。</li>
		<li><code>fixtures</code>: 全タスクを全フィクスチャに走らせ、オラクルの期待値と比べる（次の節の正しさのラチェット）。</li>
		<li>
			<code>perf</code>: arm64 の Ubuntu ランナーに valgrind を入れ、<code>node tools/perf/bin/perf.ts --instructions --json perf-report.json</code>
			を走らせる。レポートは成果物として残す。
		</li>
	</ul>
	<p>
		意図して計数を動かした変更は、同じコミットで基準値を書き換えます。割り当ては <code>mise run perf:update</code>
		で書けます。命令数は arm64 Linux で数える必要があるので、<code>tools/perf/linux.sh --update</code> が CI
		と同じ環境（<code>tools/perf/Dockerfile</code>）の Docker コンテナで測り、基準値を書き戻します。
	</p>
	<p>
		<code>linux.sh</code> は作業ツリーではなく、ステージしたソースとフィクスチャのスナップショットを測ります。次のコミットに入るものを、CI
		のクリーンなチェックアウトと同じ形で測るためです。以前はフィクスチャだけ作業ツリーのものを使っていて、手元の実行が各ユニットの横に残した
		<code>actual/</code> まで読み込みの走査が数えていました。そのため読み込みの命令数は手元で 345,677,577、CI のクリーンなチェックアウトでは 292,546,145
		と食い違っていました。クリーンなワークツリーからラチェットを走らせて見つかったものです（201b86fd6b）。
	</p>
	<DeepDive title="検査が本当に検査していることの確かめ方">
		<p>
			ラチェットを入れたとき、わざと退行を入れて赤になることを確かめています。<code>svelte/button-has-type</code> の呼び出しごとに
			<code>Vec::with_capacity(1)</code> を一つ足すと、<code>phase svelte/button-has-type allocs: 973 -&gt; 6,405</code>（+5,432、その呼び出し回数）と報告して落ち、元に戻すと
			93 個の計数のうち動いたものは 0 でした（fa4072dfa3）。
		</p>
		<p>
			正しさのラチェットも同じで、あるユニットの整形出力の末尾に 1 文字足すと <code>MOVED match -&gt; mismatch svelte.format/default …</code>
			と報告して落ちます（893f2cf1c7）。
		</p>
	</DeepDive>

	<H2 id="parity" />
	<p>
		性能のラチェットの隣に、正しさのラチェットがあります。<code>fixtures check</code> は、タスク・変種・ユニットごとに一つの判定（<code
			>match</code
		>
		か、成果物の判定のうち最も悪いもの）を出し、<code>fixtures/_registry/parity.json</code> と比べます。二方向で、件数の上限もありません。次の表は、このページをビルドしたときの
		<code>parity.json</code> を数えたものです。
	</p>
</div>

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table min-w-[640px]">
		<thead>
			<tr><th>タスク</th>{#each verdicts as v (v)}<th class="num">{v}</th>{/each}</tr>
		</thead>
		<tbody>
			{#each data.parity.rows as r (r.task)}
				<tr>
					<td><code>{r.task}</code></td>
					{#each verdicts as v (v)}<td class="num">{r.verdicts[v] ? fmt(r.verdicts[v]) : ''}</td>{/each}
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		{fmt(data.parity.units)} 件。rsvelte が未対応として拒否したユニットは表に載りません。
	</figcaption>
</figure>

<div class="prose-learn">
	<p>
		拒否したユニットを載せないので、あるユニットが新しく拒否されるようになると、表からエントリが一つ消えたものとして検出されます。<code>unparseable</code>
		は、rsvelte が JavaScript としてパースできない出力を出したユニットで、本来は拒否すべきところです。
	</p>

	<H2 id="arms" />
	<p>
		ここからは、各章で触れた壁時計のベンチマークです。<code>rsv bench</code> は五つのアームを持ち、どのアームも同じ {fmt(data.population.documents)}
		文書（{mb(data.population.bytes)} MB）に同じ四つのタスク（compile/client、compile/server、format、lint）を走らせます<Note
			>型検査は外部の <code>tsc</code> を起動するので、ベンチマークには入れていません。</Note
		>。
	</p>
	<p>
		この表の値は、ビルド <code>{data.build.rev.slice(0, 10)}</code> で測った JSON をサイトのデータとしてコミットしたものです。そのあとの性能の変更（<a
			href="/learn/polish#history">14</a
		>）は反映されていません。変更の効果は、上のラチェットの計数で測っています。
	</p>
</div>

<Code item={data.code.doc} />

<div class="prose-learn">
	<p>
		時間を測るラウンドは、アームを ABBA の順（奇数ラウンドは逆順）に交互に走らせ、{data.rounds} ラウンドの中央値を取ります。割り当てとピークは、プロセス全体の追跡を入れた別のラウンドで取ります（<a
			href="/learn/kernel/metrics#global">11</a
		>）。ビルドは metrics なしとありの二種類を、それぞれ二回走らせました。
	</p>

	<H2 id="time" />
</div>

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table min-w-[640px]">
		<thead>
			<tr><th>アーム</th><th class="w-[30%]"></th><th class="num">plain ms</th><th class="num">metrics ms</th><th class="num">各ラウンド（plain 1 回目）</th></tr>
		</thead>
		<tbody>
			{#each data.arms as x (x.name)}
				<tr>
					<td><code>{x.name}</code><div class="text-[13px] text-muted">{armDoc[x.name]}</div></td>
					<td class="align-middle"><div class="h-2 bg-surface"><div class={['h-2', x.name === 'shared' ? 'bg-fg' : 'bg-line-strong']} style:width="{(x.plain[0] / maxMs) * 100}%"></div></div></td>
					<td class="num">{x.plain.map((v) => v.toFixed(1)).join(' / ')}</td>
					<td class="num">{x.metrics.map((v) => v.toFixed(1)).join(' / ')}</td>
					<td class="num font-mono text-[12px] text-muted">{data.rawRounds[x.name].map((v: number) => v.toFixed(0)).join(' ')}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		中央値。plain と metrics はそれぞれ 2 回の実行。{data.threads} スレッド、{data.build.profile}、build {data.build.rev.slice(0, 10)}。
	</figcaption>
</figure>

<div class="prose-learn">
	<ul>
		<li>
			<strong>共有</strong>: isolated → shared で {(a('isolated').plain[0] / a('shared').plain[0]).toFixed(1)} 倍速くなります（<a
				href="/learn/kernel/db#sharing">04</a
			>）。
		</li>
		<li>
			<strong>並列化</strong>: serial → shared で {(a('serial').plain[0] / a('shared').plain[0]).toFixed(1)} 倍です（{data.threads} スレッド）。
		</li>
		<li>
			<strong>pool</strong>: nopool → shared で時間が {((1 - a('shared').plain[0] / a('nopool').plain[0]) * 100).toFixed(0)}% 減ります（<a
				href="/learn/kernel/pool#measure">12</a
			>）。
		</li>
		<li>
			<strong>ストリーミング</strong>: 時間の差は、同じアームの二回の実行の差（{Math.abs(a('streaming').plain[0] - a('streaming').plain[1]).toFixed(1)}
			ms）と同じ程度で、差があるとは言えません。
		</li>
	</ul>

	<H2 id="memory" />
</div>

<figure class="my-8 overflow-x-auto">
	<table class="table">
		<thead><tr><th>アーム</th><th class="num">割り当て回数</th><th class="num">バイト</th><th class="num">回/入力バイト</th><th class="num">ピーク増分</th></tr></thead>
		<tbody>
			{#each data.arms as x (x.name)}
				<tr>
					<td><code>{x.name}</code></td>
					<td class="num">{fmt(x.allocs)}</td>
					<td class="num">{mb(x.allocBytes)} MB</td>
					<td class="num">{x.allocsPerByte.toFixed(3)}</td>
					<td class={['num', x.name === 'streaming' && 'font-medium']}>{mb(x.peak)} MB</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		metrics ありのビルドの 1 回目、プロセス全体を追跡したラウンド（{data.threads} スレッド）。最大 RSS は {mb(data.maxRss)} MB（全アームを含むプロセスの最高値）。ラチェットの数（1
		スレッド、最後のラウンド、4 タスクではなく 9 タスク）とは比べられません。
	</figcaption>
</figure>

<div class="prose-learn">
	<p>
		ピーク増分は、結果を全部持つアームではどれも約 {mb(a('shared').peak)} MB で、スレッド数にもよりません（serial でも {mb(a('serial').peak)}
		MB）。支配しているのは処理中の作業ではなく、全結果の保持だということです。<code>run_each</code> で結果をすぐ捨てると {mb(a('streaming').peak)}
		MB になります（<a href="/learn/kernel/pipeline#run-each">06</a>）。
	</p>

	<H2 id="phases" />
	<p>
		metrics ありのビルドで、shared を一回走らせたときのフェーズ表です。self は入れ子のフェーズを除いた時間で、全スレッドの合計です。
	</p>
</div>

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table min-w-[640px]">
		<thead><tr><th>フェーズ</th><th class="num">呼び出し</th><th class="num">self ms</th><th class="num">割合</th><th class="num">self 割り当て</th><th class="num">self バイト</th></tr></thead>
		<tbody>
			{#each data.phases as p (p.name)}
				<tr>
					<td><code>{p.name}</code></td>
					<td class="num">{fmt(p.calls)}</td>
					<td class="num">{p.self_ms.toFixed(1)}</td>
					<td class="num">{((p.self_ms / totalSelf) * 100).toFixed(1)}%</td>
					<td class="num">{fmt(p.self_allocs)}</td>
					<td class="num">{mb(p.self_bytes)} MB</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">割合は、この表の self の合計に対するもの。build {data.build.rev.slice(0, 10)}。</figcaption>
</figure>

<div class="prose-learn">
	<p>
		<code>svelte.parse</code> は全文書で一回ずつ呼ばれ、下流のフェーズはパースが通った文書でだけ走ります。compile のタスク自体の self
		はごく小さく、時間はそれが求めたアーティファクトと、<code>svelte.lower.*</code>・<code>js.print</code> に付いています。
	</p>

	<H2 id="reproduce" />
</div>

<pre class="my-6 overflow-x-auto rounded-sm border border-line bg-sunken p-4 text-[13px] leading-[1.7]"><code
		># 性能のラチェット（割り当て。どのプラットフォームでも）
mise run perf
mise run perf:update

# 命令数（CI と同じ arm64 Linux のコンテナで）
tools/perf/linux.sh
tools/perf/linux.sh --update

# 壁時計のベンチマーク
cargo build --release -p rsv_cli --features metrics
./target/release/rsv bench fixtures/svelte rounds=5 json=bench.json</code
	></pre>

<div class="prose-learn">
	<p>
		<code>rsv bench</code> のレポートの <code>build.rev</code> は、ビルドしたツリーの <code>git rev-parse HEAD</code> です（差分があれば
		<code>-dirty</code> が付きます）。値を運べない欄は、0 ではなく <code>UNMEASURED</code> と書きます。
	</p>
</div>

<ChapterFooter chapter={c} />
