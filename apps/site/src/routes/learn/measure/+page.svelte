<script lang="ts">
	import ChapterFooter from '#lib/components/ChapterFooter.svelte';
	import ChapterHeader from '#lib/components/ChapterHeader.svelte';
	import Code from '#lib/components/Code.svelte';
	import DeepDive from '#lib/components/DeepDive.svelte';
	import H2 from '#lib/components/H2.svelte';
	import Note from '#lib/components/Note.svelte';
	import { chapter } from '#lib/site.ts';

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
		shared: '文書のタスクが計算結果を共有、pool あり、全スレッド',
		isolated: 'タスクごとに計算し直す',
		nopool: 'pool なし',
		serial: '1 スレッド',
		streaming: 'shared に加え、結果を確定した順に捨てる',
	};
	const totalSelf = $derived(data.phases.reduce((n, p) => n + p.self_ms, 0));
	const maxMs = $derived(Math.max(...data.arms.map((x) => x.plain[0])));
	const verdicts = [
		'match',
		'mismatch',
		'unparseable',
		'unexpected',
		'missing',
		'refused',
		'panicked',
	];
	const perByte = (n: number) => (n / data.performance.instructionSample.source_bytes).toFixed(1);
</script>

<svelte:head><title>{c.title} — rsvelte 開発者向けの教材</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="rsvelte は、マシンの混み具合で揺れない量を数え、記録した基準値と比べます。この検査は main と experimental への push と、すべての pull request で走ります。各章で引用した実行時間のベンチマークの測り方も、この章で示します。"
/>

<div class="prose-learn">
	<H2 id="ratchet" />
	<p>
		<dfn>基準値との比較検査</dfn
		>は、メモリを確保した回数とバイト数、実行した命令の数を数えて基準値と比べる検査です。数える対象は、検証用のソースファイル集（公式ツールの出力と比べる、実在する
		Svelte ファイルの集まり）です。その値を
		<code>tools/performance/baseline.json</code> と比べ、増えていれば自動検査を失敗させます。減ったときも、基準値を書き換えていなければ失敗します。改善した変更は同じコミットで基準値を更新するので、次からはその値が基準になります。
	</p>
	<p>次の数は、このページをビルドしたときの <code>baseline.json</code> の値です。</p>
</div>

<figure class="my-8 overflow-x-auto">
	<table class="table [&_td:first-child]:pr-6 [&_td:first-child]:whitespace-nowrap">
		<tbody>
			<tr
				><td>対象</td><td class="num"
					>{fmt(data.performance.population.documents)} 文書、{fmt(
						data.performance.population.source_bytes,
					)} バイト</td
				></tr
			>
			<tr
				><td>タスク</td><td class="font-mono text-[13px]"
					>{data.performance.population.tasks.join(' · ')}</td
				></tr
			>
			<tr
				><td>割り当て（最後の 1 ラウンド）</td><td class="num"
					>{fmt(data.performance.allocations)} 回</td
				></tr
			>
			<tr><td>割り当てバイト</td><td class="num">{fmt(data.performance.allocBytes)}</td></tr>
			<tr><td>使用中のメモリのピーク増分</td><td class="num">{fmt(data.performance.peak)}</td></tr>
			<tr
				><td
					>命令数、1 ラウンド（{data.performance.platform}、{fmt(
						data.performance.instructionSample.documents,
					)} 文書）</td
				><td class="num"
					>{fmt(data.performance.instructions)}（入力 1 バイトあたり {perByte(
						data.performance.instructions,
					)}）</td
				></tr
			>
			<tr
				><td
					>命令数、読み込み（{data.performance.platform}、{fmt(
						data.performance.instructionSample.documents,
					)} 文書）</td
				><td class="num"
					>{fmt(data.performance.load)}（入力 1 バイトあたり {perByte(data.performance.load)}）</td
				></tr
			>
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		最後に基準値を書き換えたコミット（<code>{data.performance.last.sha ?? '作業ツリー'}</code
		>）は「{data.performance.last.subject}」です。記録の推移は
		<a class="link" href="/learn/polish#history">15 章「磨きどころ」</a>にあります。
	</figcaption>
</figure>

<div class="prose-learn">
	<H2 id="counters" />
	<p>数える量は三種類です。</p>
	<ul>
		<li>
			割り当て：<code>metrics</code> feature 付きの <code>rsvelte performance</code>
			が、<code>CountingAllocator</code>（<a href="/learn/kernel/measurement#alloc">12 章</a
			>）で数えます。これは確保を数えるアロケータです。数えるのは最後のラウンドです（1
			ラウンドは、全文書を 1
			回処理すること）。数えるのは全体の数と、フェーズ（計算結果、タスク、ルール）ごとの呼び出し回数・割り当て回数・バイト数です。使用中のメモリのピーク増分も数えます。基準値とは完全一致で比べます。
		</li>
		<li>
			命令数（1 ラウンド）：metrics なしの出荷用ビルドが実行した命令の総数を、Valgrind の cachegrind
			で数えます。cachegrind はこれを <code>I references</code> と表示します。<code>rounds=2</code>
			の実行から
			<code>rounds=1</code>
			の実行を引くので、温まったラウンド 1 回分の数になります。基準値とは ±0.2% の幅で比べます。cachegrind
			は実機よりずっと遅いので、命令数は一部の文書だけで数えます。検証用のソースファイル集を名前順に並べ、{data
				.performance.instructionSample.every} 個に 1 個（{fmt(
				data.performance.instructionSample.documents,
			)} 文書）を選びます。<code>rounds=0</code>・<code>rounds=1</code>・<code>rounds=2</code>
			の 3 回の実行は同時に走らせます。割り当ては全文書で数えます。
		</li>
		<li>
			命令数（読み込み）：<code>rounds=0</code> の実行、つまり起動、ディレクトリの走査、ファイルの読み込み、文書の構築です。CLI
			を呼ぶたびにかかるので、別に数えます。比べ方は同じく ±0.2% です。
		</li>
	</ul>
</div>

<Code item={data.code.perfDoc} />

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table min-w-[560px]">
		<thead
			><tr
				><th>フェーズ</th><th class="num">呼び出し</th><th class="num">割り当て</th><th class="num"
					>バイト</th
				></tr
			></thead
		>
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
		基準値のフェーズ表です。割り当て回数の多い順に並べています。割り当ては
		self（入れ子のフェーズを除いた分）です。
	</figcaption>
</figure>

<div class="prose-learn">
	<H2 id="determinism" />
	<p>
		比較検査で値を厳密に比べられるのは、数える量が入力とバイナリだけで決まるように測っているからです。
	</p>
	<ul>
		<li>
			1
			スレッドで走らせます。並列に走らせると、どの文書がどのスレッドのバッファプールに当たるかが実行ごとに変わり、割り当ての回数も変わります。1
			スレッドなら、割り当ての列は入力とバイナリだけで決まります。導入したコミットでは、コミット済みの検証用のソースファイル集を
			2 回測り、結果がバイト単位で一致しました。
		</li>
		<li>
			最後のラウンドだけを数えます。最初のラウンドはバッファプール（作業用の配列を使い回す仕組み、<a
				href="/learn/kernel/buffer-pool">13 章</a
			>）が空なので、容量を伸ばす割り当てが混ざります。
		</li>
		<li>
			プラットフォームに依存する割り当てをなくしました。結果をまとめて返す <code>run</code>
			が文書ごとに
			<code>Mutex</code>
			を使っていたころは、macOS のロック処理が初回にメモリを確保しました。そのため macOS と Linux では、割り当て回数が文書数だけ違っていました。ロックをなくしてからは、二つのプラットフォームが同じ数を報告します（<a
				href="/learn/kernel/pipeline#run">06 章</a
			>）。
		</li>
		<li>
			ファイルシステムの順序に依存しません。CLI
			は各ディレクトリの項目を名前の順に深さ優先でたどって読み込むので、どのファイルシステムでも文書は同じ順に並びます。
		</li>
		<li>
			時間ではなく命令を数えます。命令数も、同じマシンではほぼ同じ値になります。同じツリーを 2
			回測った差は 1e-7 程度でした。ただし同じ arm64 Linux でも、自動検査のマシンと手元では、CPU や
			libc の違いで選ばれる関数の変わることがあります。±0.2% の幅はその違いを吸収します。
		</li>
	</ul>
	<p>
		命令数は、基準値を記録したプラットフォーム（今は arm64
		Linux）でだけ比べます。割り当てはどのプラットフォームでも同じ数になるので、macOS の手元でも <code
			>mise run performance</code
		>
		で比べられます。命令数を数えない実行では、その欄に 0 ではなく <code>UNMEASURED</code>
		と表示します。ベンチマークのレポートも、値を出せない欄は同じように書きます。
	</p>

	<H2 id="ci" />
	<p>
		<code>.github/workflows/ci.yml</code> は、次のジョブを同時に走らせます。
	</p>
	<ul>
		<li><code>rust-format</code>：固定した nightly の rustfmt による整形の確認。</li>
		<li>
			<code>rust-lint</code>：二つの feature の組み合わせでの clippy によるコード検査と、rustdoc。
		</li>
		<li>
			<code>rust-test</code
			>：テスト。全検証例を公式ツールの出力と比べる、正しさの基準値との比較検査（次の節）も含む。
		</li>
		<li>
			<code>oracle</code>：ディレクトリ構成の検査と、公式ツールを動かす道具（<code
				>tools/oracle</code
			>）自身のテスト。
		</li>
		<li>
			<code>typescript</code>：pnpm のワークスペース（サイトと <code>tools/</code>）の oxfmt
			による整形、oxlint と knip によるコード検査、型の検査。
		</li>
		<li><code>site</code>：このサイトのテスト、svelte-check、ビルド。</li>
		<li>
			<code>performance</code>：arm64 の Ubuntu で、割り当てと命令数を基準値と比べる。命令数は
			Valgrind で数え、レポートは成果物として保存する。コマンドは次のとおり。
			<pre
				class="my-2 overflow-x-auto rounded-sm border border-line bg-sunken p-3 text-[13px]"><code
					>node tools/performance/performance.ts ratchet --instructions --json performance-report.json</code
				></pre>
		</li>
	</ul>
	<p>
		計数を意図して動かした変更は、同じコミットで基準値を書き換えます。割り当ては <code
			>mise run performance:update</code
		>
		で更新します。命令数は <code>node tools/performance/performance.ts linux --update</code>
		で更新します。このコマンドは自動検査と同じ Docker 環境で測り、結果を基準値に書き戻します。
	</p>
	<p>
		<code>performance.ts linux</code>（実装は
		<code>linux.ts</code
		>）は、ステージしたソースとテスト用の入力と期待値のスナップショットを測ります。次のコミットに入るものを、自動検査のクリーンなチェックアウトと同じ形で測るためです。作業ツリーを測ると、手元の実行が各検証例の横に残した
		<code>actual/</code> まで読み込みで数えてしまいます。実際に、読み込みの命令数が手元では 345,677,577、クリーンなチェックアウトでは
		292,546,145 と食い違ったことがあります。
	</p>
	<DeepDive title="検査が失敗することを確かめる">
		<p>
			検査を入れたときに、わざと性能を悪くして、検査が失敗することを確かめました。コード検査のルール
			<code>svelte/button-has-type</code>
			を呼ぶたびに、要素一つの配列を余分に確保しました。当時の検証用のソースファイル集（17,512 文書）で、このフェーズの割り当て回数は
			973 回から 6,405 回に増え、検査は失敗しました。増えた 5,432 回は、ルールを呼んだ回数と同じです。変更を戻すと、当時比べていた
			93 個の計数はすべて元に戻りました。
		</p>
		<p>
			出力を比べる検査も同じように確かめました。ある検証例の整形結果の末尾に 1
			文字足すと、判定が一致から不一致に変わったと報告して失敗します。
		</p>
	</DeepDive>

	<H2 id="parity" />
	<p>
		出力が公式ツールと一致するかも検査します。<code>cargo test</code>
		は、タスク・出力の種類・検証例ごとに判定を一つ出します。成果物が複数あるときは、いちばん悪い判定を採ります。判定を
		<code>corpus/_registry/parity/</code>
		の記録と比べ、悪化も改善も検出します。次の表は、このページをビルドしたときの記録を数えたものです。
	</p>
</div>

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table min-w-[640px]">
		<thead>
			<tr
				><th>タスク</th>{#each verdicts as v (v)}<th class="num">{v}</th>{/each}</tr
			>
		</thead>
		<tbody>
			{#each data.parity.rows as r (r.task)}
				<tr>
					<td><code>{r.task}</code></td>
					{#each verdicts as v (v)}<td class="num">{r.verdicts[v] ? fmt(r.verdicts[v]) : ''}</td
						>{/each}
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		合計 {fmt(data.parity.units)} 件です。
	</figcaption>
</figure>

<div class="prose-learn">
	<p>
		そのため、ある検証例が新しく拒否されると、表のエントリが一つ消えたものとして検出されます。<code
			>unparseable</code
		>
		は、rsvelte の出力を JavaScript として読めない検証例です。本来は拒否すべきものです。<code
			>mismatch</code
		>
		は出力が違う検証例です。<code>unexpected</code> は rsvelte だけが、<code>missing</code>
		は公式ツールだけがファイルを書いた検証例です。<code>svue</code> は Vue のファイルを Svelte
		でコンパイルし、<code>vuelte</code> は Svelte のファイルを Vue Vapor にコンパイルします。
	</p>

	<H2 id="arms" />
	<p>
		ここからは、各章で引用した実行時間の計測です。<dfn>測定条件</dfn>は、rsvelte
		自身の設定を一つずつ変えた五つの実行で、ほかのツールとの比較ではありません。どれも同じ {fmt(
			data.population.documents,
		)} 文書（{mb(data.population.bytes)} メガバイト）を、クライアント用とサーバー用にコンパイルし、整形し、コード検査します<Note
			>型検査は外部の <code>tsc</code> を起動するので、ベンチマークに入れていません。</Note
		>。
	</p>
	<p>
		表の値は、ビルド（<code>{data.build.rev.slice(0, 10)}</code>）で測った JSON
		を、サイトのデータとしてコミットしたものです。実行時間はマシンの混み具合で揺れるので、自動検査では監視していません。測り直すまで、この値は変わりません。変更の効果は、上の比較検査の計数で確かめます。
	</p>
</div>

<Code item={data.code.doc} />

<div class="prose-learn">
	<p>
		測定条件を走らせる順は、時間を測るラウンドごとに正順と逆順を入れ替えます。値は {data.rounds}
		ラウンドの中央値です。割り当てとピークは、プロセス全体の追跡を入れた別のラウンドで取ります（<a
			href="/learn/kernel/measurement#global">12</a
		>）。ビルドは metrics なしとありの 2 種類で、それぞれ 2 回走らせました。
	</p>

	<H2 id="time" />
</div>

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table min-w-[640px]">
		<thead>
			<tr
				><th>測定条件</th><th class="w-[30%]"></th><th class="num">plain ms</th><th class="num"
					>metrics ms</th
				><th class="num">各ラウンド（plain 1 回目）</th></tr
			>
		</thead>
		<tbody>
			{#each data.arms as x (x.name)}
				<tr>
					<td
						><code>{x.name}</code>
						<div class="text-[13px] text-muted">{armDoc[x.name]}</div></td
					>
					<td class="align-middle"
						><div class="h-2 bg-surface">
							<div
								class={['h-2', x.name === 'shared' ? 'bg-fg' : 'bg-line-strong']}
								style:width="{(x.plain[0] / maxMs) * 100}%"
							></div>
						</div></td
					>
					<td class="num">{x.plain.map((v) => v.toFixed(1)).join(' / ')}</td>
					<td class="num">{x.metrics.map((v) => v.toFixed(1)).join(' / ')}</td>
					<td class="num font-mono text-[12px] text-muted"
						>{data.rawRounds[x.name].map((v) => v.toFixed(0)).join(' ')}</td
					>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		plain と metrics の列は、metrics なしとありのビルドをそれぞれ 2 回実行したときの、1
		ラウンドの時間の中央値です。スレッド数は
		{data.threads}、ビルド設定は {data.build.profile}、コミットは {data.build.rev.slice(0, 10)} です。
	</figcaption>
</figure>

<div class="prose-learn">
	<ul>
		<li>
			共有：isolated → shared で {(a('isolated').plain[0] / a('shared').plain[0]).toFixed(1)} 倍速くなります（<a
				href="/learn/kernel/database#sharing">04</a
			>）。
		</li>
		<li>
			並列化：serial → shared で {(a('serial').plain[0] / a('shared').plain[0]).toFixed(1)} 倍です（{data.threads}
			スレッド）。
		</li>
		<li>
			pool：nopool → shared で時間が {(
				(1 - a('shared').plain[0] / a('nopool').plain[0]) *
				100
			).toFixed(0)}% 減ります（<a href="/learn/kernel/buffer-pool#measure">13</a>）。
		</li>
		<li>
			ストリーミング：streaming と shared の差は、streaming の 2 回の実行の差（{Math.abs(
				a('streaming').plain[0] - a('streaming').plain[1],
			).toFixed(1)}
			ms）と同程度で、揺れと区別できません。
		</li>
	</ul>

	<H2 id="memory" />
</div>

<figure class="my-8 overflow-x-auto">
	<table class="table">
		<thead
			><tr
				><th>測定条件</th><th class="num">割り当て回数</th><th class="num">バイト</th><th
					class="num">回/入力バイト</th
				><th class="num">ピーク増分</th></tr
			></thead
		>
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
		metrics ありのビルドの 1 回目で、プロセス全体を追跡したラウンドの値です（{data.threads}
		スレッド）。プロセスの最大物理メモリ使用量は {mb(data.maxRss)}
		メガバイトです（全測定条件を通したプロセスの最高値）。基準値の数とは、スレッド数（基準値は 1）、数えるラウンド（基準値は最後の
		1 回）、タスクの数が違うので比べられません。
	</figcaption>
</figure>

<div class="prose-learn">
	<p>
		結果を全部持つ測定条件のピーク増分は、どれも約 {mb(a('shared').peak)}
		メガバイトです。スレッド数にもよりません（serial でも {mb(a('serial').peak)}
		メガバイト）。ピークを決めているのは処理中の作業ではなく、全結果の保持です。<code>run_each</code
		>
		で結果をすぐ捨てると {mb(a('streaming').peak)} メガバイトになります（<a
			href="/learn/kernel/pipeline#run-each">06</a
		>）。
	</p>

	<H2 id="phases" />
	<p>
		metrics ありのビルドで shared を 1 回走らせたときのフェーズ表です。self
		は入れ子のフェーズを除いた時間で、全スレッドの合計です。上の基準値の表とはビルドが違うので、名前の違うフェーズがあります。
	</p>
</div>

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table min-w-[640px]">
		<thead
			><tr
				><th>フェーズ</th><th class="num">呼び出し</th><th class="num">self ms</th><th class="num"
					>割合</th
				><th class="num">self 割り当て</th><th class="num">self バイト</th></tr
			></thead
		>
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
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		割合は、この表の self の合計に対する値です。ビルドは {data.build.rev.slice(0, 10)} です。
	</figcaption>
</figure>

<div class="prose-learn">
	<p>
		<code>svelte.parse</code>
		は全文書で 1 回ずつ呼ばれます。下流のフェーズは、構文解析が通った文書でだけ走ります。compile のタスク自体の
		self はごく小さく、時間はタスクが求めた計算結果と、<code>svelte.lower.*</code>・<code
			>js.print</code
		> に付きます。
	</p>

	<H2 id="reproduce" />
</div>

<pre
	class="my-6 overflow-x-auto rounded-sm border border-line bg-sunken p-4 text-[13px] leading-[1.7]"><code
		># 性能の基準値との比較検査（割り当て。どのプラットフォームでも）
mise run performance
mise run performance:update

# 命令数（CI と同じ arm64 Linux のコンテナで）
node tools/performance/performance.ts linux
node tools/performance/performance.ts linux --update

# 実行時間のベンチマーク
cargo build --release -p rsvelte_command_line --features metrics
./target/release/rsvelte benchmark corpus/svelte rounds=5 json=benchmark.json</code
	></pre>

<div class="prose-learn">
	<p>
		<code>rsvelte benchmark</code> のレポートの <code>build.rev</code> は、ビルドしたツリーの
		<code>git rev-parse HEAD</code> です。差分があれば <code>-dirty</code>
		が付きます。
	</p>
	<p>
		このサイトのベンチマークのデータ（<code>apps/site/src/lib/data/benchmark/</code>）は、古いビルド
		<code>d6f426e250</code>
		の出力です。データの欄の名前は、あとで書き換えました。たとえば今のコマンドは
		<code>allocs</code> と書きますが、データは <code>allocations</code> です。そのため、今のコマンドの出力は、そのままサイトのデータとして使えません。
	</p>
</div>

<ChapterFooter chapter={c} />
