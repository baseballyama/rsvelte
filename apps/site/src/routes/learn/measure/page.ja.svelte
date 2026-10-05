<script lang="ts">
	import Term from '$lib/components/Term.svelte';
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import DeepDive from '$lib/components/DeepDive.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';

	let { data } = $props();
	const c = chapter('measure', 'ja');
	const workingTree = '作業ツリー（未コミット）';
	const fmt = (n: number) => n.toLocaleString('en-US');
	const mb = (b: number) => (b / 1e6).toFixed(1);
	const a = (name: string) => {
		const x = data.arms.find((y) => y.name === name);
		if (!x) throw new Error(`no arm ${name}`);
		return x;
	};
	const armDoc: Record<string, string> = {
		shared: '文書のタスクが計算結果を共有、pool あり、全スレッド',
		isolated: 'タスクごとに計算し直す',
		nopool: 'pool なし',
		serial: '1 スレッド',
		streaming: 'shared に加え、結果を確定した順に捨てる'
	};
	const totalSelf = $derived(data.phases.reduce((n, p) => n + p.self_ms, 0));
	const maxMs = $derived(Math.max(...data.arms.map((x) => x.plain[0])));
	const verdicts = ['match', 'mismatch', 'unparseable', 'unexpected', 'missing'];
	const perByte = (n: number) => (n / data.performance.population.source_bytes).toFixed(1);
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="性能は一度測って終わりではありません。rsvelte は、マシンの混み具合で揺れない量だけを数えて記録した値と比べる検査を、main と experimental への push とすべての pull request で走らせています。この章では、その仕組みと、各章で触れた実行時間のベンチマークの出どころを見ます。"
/>

<div class="prose-learn">
	<H2 id="ratchet" />
	<p>
		<dfn>基準値との比較検査</dfn>では、記録した値からの変化を検出します。検証用のソースファイル集を処理し、メモリを確保する回数・バイト数・命令数を測ります。
		これらを <code>tools/performance/baseline.json</code> と比べます。増えていれば自動検査を失敗させます。
		減っていても、基準値を書き換えていなければ失敗します。改善した変更と一緒に基準値を更新し、次回からその値を使います。
	</p>
	<p>次の数は、このページをビルドしたときの <code>tools/performance/baseline.json</code> から読んでいます。</p>
</div>

<figure class="my-8 overflow-x-auto">
	<table class="table [&_td:first-child]:pr-6 [&_td:first-child]:whitespace-nowrap">
		<tbody>
			<tr><td>母集団</td><td class="num">{fmt(data.performance.population.documents)} 文書、{fmt(data.performance.population.source_bytes)} バイト</td></tr>
			<tr><td>タスク</td><td class="font-mono text-[13px]">{data.performance.population.tasks.join(' · ')}</td></tr>
			<tr><td>割り当て（最後の 1 ラウンド）</td><td class="num">{fmt(data.performance.allocations)} 回</td></tr>
			<tr><td>割り当てバイト</td><td class="num">{fmt(data.performance.allocBytes)}</td></tr>
			<tr><td>使用中のメモリのピーク増分</td><td class="num">{fmt(data.performance.peak)}</td></tr>
			<tr
				><td>命令数、1 ラウンド（{data.performance.platform}）</td><td class="num"
					>{fmt(data.performance.instructions)}（入力 1 バイトあたり {perByte(data.performance.instructions)}）</td
				></tr
			>
			<tr
				><td>命令数、読み込み（{data.performance.platform}）</td><td class="num">{fmt(data.performance.load)}（入力 1 バイトあたり {perByte(data.performance.load)}）</td
				></tr
			>
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		最後にこの基準値を書き換えたのは {#if data.performance.last.sha === null}{workingTree}{:else}<code>{data.performance.last.sha}</code>（<span lang="en"
				>{data.performance.last.subject}</span
			>）{/if}。記録の推移は <a class="link" href="/learn/polish#history"
			>14 磨きどころ</a
		> にあります。
	</figcaption>
</figure>

<div class="prose-learn">
	<H2 id="counters" />
	<p>数える量は三種類です。</p>
	<ul>
		<li>
			割り当て: <code>metrics</code> feature を入れたビルドの <code>rsvelte performance</code> が、<Term name="CountingAllocator" />（<a
				href="/learn/kernel/measurement#alloc">11</a
			>）で最後のラウンドの割り当て回数とバイト数を数えます。全体の数に加え、フェーズ（計算結果、タスク、ルール）ごとの呼び出し回数・割り当て回数・バイト数、それに使用中のメモリのピーク増分です。比べ方は<strong>完全一致</strong>です。
		</li>
		<li>
			命令数（1 ラウンド）: metrics なしの出荷用ビルドを cachegrind（valgrind）の下で走らせ、実行した命令の数（<code>I references</code>）を数えます。<code
				>rounds=2</code
			>
			の実行から <code>rounds=1</code> の実行を引くので、ちょうど温まった 1 ラウンドの分になります。比べ方は <strong>±0.2%</strong> です。
		</li>
		<li>
			命令数（読み込み）: <code>rounds=0</code> の実行、つまり起動、ディレクトリの走査、ファイルの読み込み、文書の構築です。コマンドラインの実行プログラム
			を呼ぶたびに払う分なので、別に数えます。比べ方は同じく ±0.2% です。
		</li>
	</ul>
</div>

<Code item={data.code.perfDoc} />

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table min-w-[560px]">
		<thead><tr><th>フェーズ</th><th class="num">呼び出し</th><th class="num">割り当て</th><th class="num">バイト</th></tr></thead>
		<tbody>
			{#each data.performance.phases as p (p.name)}
				<tr>
					<td><code>{p.name}</code></td>
					<td class="num">{fmt(p.calls)}</td>
					<td class="num">{fmt(p.allocations)}</td>
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
	<p>基準値との比較検査が厳密に比べられるのは、数える量が入力とバイナリだけで決まるように測り方を選んでいるからです。</p>
	<ul>
		<li>
			<strong>1 スレッドで走らせる。</strong>並列に走らせると、どの文書がどのスレッドのバッファプールに当たるかが実行ごとに変わり、割り当ての回数も変わります。1
			スレッドなら、割り当ての列は入力とバイナリの関数です。導入したコミットでは、コミット済みの検証用のソースファイル集を 2 回測った結果がバイト単位で一致しました（fa4072dfa3）。
		</li>
		<li>
			<strong>最後のラウンドだけを数える。</strong>最初のラウンドはバッファプールが空で、容量を伸ばす割り当てが混ざります。数えるのはプールが温まった最後のラウンドです。
		</li>
		<li>
			<strong>プラットフォームに依存する割り当てを消す。</strong><code>run</code> が文書ごとに <code>Mutex</code>
			を使っていたころは、macOS のロック処理が初回にメモリを確保しました。macOS と Linux で割り当て回数が文書数だけ違っていたのはそのためです。
			ロックをなくしてから、二つのプラットフォームは同じ数を報告します（a5f67528cd、<a
				href="/learn/kernel/pipeline#run">06</a
			>）。
		</li>
		<li>
			<strong>ファイルシステムの順序に依存しない。</strong>コマンドラインの実行プログラム の読み込みは、各ディレクトリの項目を名前の順に深さ優先でたどります。どのファイルシステムでも、文書は同じ順に並びます（a5822ee26f）。
		</li>
		<li>
			<strong>時間ではなく命令を数える。</strong>命令数も同じマシンではほぼ同じ値を繰り返します。同じツリーを 2 回測った差は 1e-7 程度でした（a5f67528cd）。±0.2%
			の幅は、libc や プロセッサー ごとの関数の選び分けの違いを吸収するためのものです。
		</li>
	</ul>
	<p>
		命令数は、基準値を記録したプラットフォーム（今は arm64 Linux）でだけ比べます。割り当ては、どのプラットフォームでも同じ数になるので、macOS
		の手元でも <code>mise run performance</code> で比べられます。命令数を数えない実行では、その欄は <code>UNMEASURED</code> と表示され、0 とは書きません。
	</p>

	<H2 id="ci" />
	<p>
		<code>.github/workflows/ci.yml</code> は、main と experimental への push と、すべての pull request で四つのジョブを走らせます。
	</p>
	<ul>
		<li><code>rust</code>: 整形、二つの feature の組み合わせでの clippy、rustdoc、テスト。</li>
		<li><code>fixtures</code>: 全タスクを全テスト用の入力と期待値に走らせ、比較元の公式ツールの期待値と比べる（次の節の正しさの基準値との比較検査）。</li>
		<li><code>site</code>: このサイトのテスト、型の検査、ビルド。</li>
		<li>
			<code>performance</code>: 64ビットの Arm プロセッサーを使う Ubuntu 上で命令数を測ります。計測には Valgrind を使います。
			コマンド:<br />
			<code>node tools/performance/bin/performance.ts --instructions --json performance-report.json</code>。
			レポートは成果物として保存します。
		</li>
	</ul>
	<p>
		意図して計数を動かした変更は、同じコミットで基準値を書き換えます。割り当ては <code>mise run performance:update</code>
		で更新します。命令数は64ビットの Arm プロセッサーを使う Linux 上で測ります。
		<code>tools/performance/linux.sh --update</code> は自動検査と同じ Docker 環境で計測します。その結果を基準値として書き戻します。
	</p>
	<p>
		<code>linux.sh</code> は作業ツリーではなく、ステージしたソースとテスト用の入力と期待値のスナップショットを測ります。次のコミットに入るものを、変更時の自動検査
		のクリーンなチェックアウトと同じ形で測るためです。以前はテスト用の入力と期待値だけ作業ツリーのものを使っていて、手元の実行が各検証例の横に残した
		<code>actual/</code> まで読み込みの走査が数えていました。そのため読み込みの命令数は手元で 345,677,577、変更時の自動検査 のクリーンなチェックアウトでは 292,546,145
		と食い違っていました。クリーンなワークツリーから基準値との比較検査を走らせて見つかったものです（201b86fd6b）。
	</p>
	<DeepDive title="検査が本当に検査していることの確かめ方">
		<p>
			検査を導入したときは、意図的に性能を悪化させ、検査が失敗することを確認しています。
			ボタンの検査ルールの呼び出しごとに、要素一つ分の配列を余分に確保しました。
			割り当て回数は973回から6,405回に増え、検査が失敗しました。増分の5,432回はルールの呼び出し回数と同じです。
			変更を戻すと、93個の計測値はすべて元に戻りました（fa4072dfa3）。
		</p>
		<p>
			出力を比べる検査にも、意図的な変更を入れて確認しました。
			ある検証例の整形結果の末尾に一文字加えると、一致から不一致に変わったことを報告して失敗します（893f2cf1c7）。
		</p>
	</DeepDive>

	<H2 id="parity" />
	<p>
		性能だけでなく、出力の一致も検査します。<code>fixtures check</code> は、タスク・出力の種類・検証例ごとに判定を出します。
		複数の成果物がある場合は、最も悪い判定を採用します。
		判定を <code>fixtures/_registry/parity.json</code> と比べ、改善も悪化も検出します。検査する件数に上限はありません。次の表は、このページをビルドしたときの
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
		{fmt(data.parity.units)} 件。rsvelte が未対応として拒否した検証例は表に載りません。
	</figcaption>
</figure>

<div class="prose-learn">
	<p>
		拒否した検証例を載せないので、ある検証例が新しく拒否されるようになると、表からエントリが一つ消えたものとして検出されます。<code>unparseable</code>
		は、rsvelte が JavaScript としてパースできない出力を出した検証例で、本来は拒否すべきところです。
	</p>

	<H2 id="arms" />
	<p>
		ここからは、各章で触れた実行時間の計測結果です。五つの条件を比べます。
		どれも同じ {fmt(data.population.documents)} 文書（{mb(data.population.bytes)} メガバイト）を処理します。
		実行する処理は、クライアント用・サーバー用のコンパイル、整形、コード検査です<Note
			>型検査は外部の <code>tsc</code> を起動するので、ベンチマークには入れていません。</Note
		>。
	</p>
	<p>
		この表の値は、ビルド <code>{data.build.rev.slice(0, 10)}</code> で測った 構造化データ形式をサイトのデータとしてコミットしたものです。実行時間はマシンの混み具合で揺れるので 変更時の自動検査 では監視しておらず、測り直すまでこの値は更新されません。変更の効果は、上の基準値との比較検査の計数で測っています。
	</p>
</div>

<Code item={data.code.doc} />

<div class="prose-learn">
	<p>
		時間を測るラウンドは、比較対象を 比較対象を順に実行し、逆順でも実行する の順（奇数ラウンドは逆順）に交互に走らせ、{data.rounds} ラウンドの中央値を取ります。割り当てとピークは、プロセス全体の追跡を入れた別のラウンドで取ります（<a
			href="/learn/kernel/measurement#global">11</a
		>）。ビルドは metrics なしとありの二種類を、それぞれ二回走らせました。
	</p>

	<H2 id="time" />
</div>

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table min-w-[640px]">
		<thead>
			<tr><th>比較対象</th><th class="w-[30%]"></th><th class="num">plain ms</th><th class="num">metrics ms</th><th class="num">各ラウンド（plain 1 回目）</th></tr>
		</thead>
		<tbody>
			{#each data.arms as x (x.name)}
				<tr>
					<td><code>{x.name}</code><div class="text-[13px] text-muted">{armDoc[x.name]}</div></td>
					<td class="align-middle"><div class="h-2 bg-surface"><div class={['h-2', x.name === 'shared' ? 'bg-fg' : 'bg-line-strong']} style:width="{(x.plain[0] / maxMs) * 100}%"></div></div></td>
					<td class="num">{x.plain.map((v) => v.toFixed(1)).join(' / ')}</td>
					<td class="num">{x.metrics.map((v) => v.toFixed(1)).join(' / ')}</td>
					<td class="num font-mono text-[12px] text-muted">{data.rawRounds[x.name].map((v) => v.toFixed(0)).join(' ')}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		計測機能なし・ありで、それぞれ2回実行した中央値です。スレッド数は {data.threads} です。
		ビルド設定は {data.build.profile}、コミットは {data.build.rev.slice(0, 10)} です。
	</figcaption>
</figure>

<div class="prose-learn">
	<ul>
		<li>
			共有: isolated → shared で {(a('isolated').plain[0] / a('shared').plain[0]).toFixed(1)} 倍速くなります（<a
				href="/learn/kernel/database#sharing">04</a
			>）。
		</li>
		<li>
			並列化: serial → shared で {(a('serial').plain[0] / a('shared').plain[0]).toFixed(1)} 倍です（{data.threads} スレッド）。
		</li>
		<li>
			pool: nopool → shared で時間が {((1 - a('shared').plain[0] / a('nopool').plain[0]) * 100).toFixed(0)}% 減ります（<a
				href="/learn/kernel/buffer-pool#measure">12</a
			>）。
		</li>
		<li>
			ストリーミング: 時間の差は、同じ比較対象の二回の実行の差（{Math.abs(a('streaming').plain[0] - a('streaming').plain[1]).toFixed(1)}
			ms）と同じ程度で、差があるとは言えません。
		</li>
	</ul>

	<H2 id="memory" />
</div>

<figure class="my-8 overflow-x-auto">
	<table class="table">
		<thead><tr><th>比較対象</th><th class="num">割り当て回数</th><th class="num">バイト</th><th class="num">回/入力バイト</th><th class="num">ピーク増分</th></tr></thead>
		<tbody>
			{#each data.arms as x (x.name)}
				<tr>
					<td><code>{x.name}</code></td>
					<td class="num">{fmt(x.allocations)}</td>
					<td class="num">{mb(x.allocBytes)} メガバイト</td>
					<td class="num">{x.allocationsPerByte.toFixed(3)}</td>
					<td class={['num', x.name === 'streaming' && 'font-medium']}>{mb(x.peak)} メガバイト</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		metrics ありのビルドの 1 回目、プロセス全体を追跡したラウンド（{data.threads} スレッド）。最大 プロセスが使用する物理メモリ は {mb(data.maxRss)} メガバイト（全比較対象を含むプロセスの最高値）。基準値との比較検査の数（1
		スレッド、最後のラウンド、タスクの数も違う）とは比べられません。
	</figcaption>
</figure>

<div class="prose-learn">
	<p>
		ピーク増分は、結果を全部持つ比較対象ではどれも約 {mb(a('shared').peak)} メガバイト で、スレッド数にもよりません（serial でも {mb(a('serial').peak)}
		メガバイト）。支配しているのは処理中の作業ではなく、全結果の保持だということです。<code>run_each</code> で結果をすぐ捨てると {mb(a('streaming').peak)}
		メガバイト になります（<a href="/learn/kernel/pipeline#run-each">06</a>）。
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
					<td class="num">{fmt(p.self_allocations)}</td>
					<td class="num">{mb(p.self_bytes)} メガバイト</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">割合は、この表の self の合計に対するもの。build {data.build.rev.slice(0, 10)}。</figcaption>
</figure>

<div class="prose-learn">
	<p>
		<code>svelte.parse</code> は全文書で一回ずつ呼ばれ、下流のフェーズはパースが通った文書でだけ走ります。compile のタスク自体の self
		はごく小さく、時間はそれが求めた計算結果と、<code>svelte.lower.*</code>・<code>js.print</code> に付いています。
	</p>

	<H2 id="reproduce" />
</div>

<pre class="my-6 overflow-x-auto rounded-sm border border-line bg-sunken p-4 text-[13px] leading-[1.7]"><code
		># 性能のラチェット（割り当て。どのプラットフォームでも）
mise run performance
mise run performance:update

# 命令数（CI と同じ arm64 Linux のコンテナで）
tools/performance/linux.sh
tools/performance/linux.sh --update

# 壁時計のベンチマーク
cargo build --release -p rsvelte_command_line --features metrics
./target/release/rsvelte benchmark fixtures/svelte rounds=5 json=benchmark.json</code
	></pre>

<div class="prose-learn">
	<p>
		<code>rsvelte benchmark</code> のレポートの <code>build.rev</code> は、ビルドしたツリーの <code>git rev-parse HEAD</code> です（差分があれば
		<code>-dirty</code> が付きます）。値を運べない欄は、0 ではなく <code>UNMEASURED</code> と書きます。
	</p>
	<p>
		このサイトのベンチマークのデータ（<code>apps/site/src/lib/data/benchmark/</code>）は、古いビルド（d6f426e250）の出力です。欄の名前は、あとで書き換えてあります（e9c1458ade）。たとえば今のコマンドは
		<code>allocs</code> と書きますが、データは <code>allocations</code> です。今のコマンドの出力は、そのままではサイトのデータになりません。
	</p>
</div>

<ChapterFooter chapter={c} />
