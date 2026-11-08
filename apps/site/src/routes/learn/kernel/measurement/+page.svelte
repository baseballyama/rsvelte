<script lang="ts">
	import ChapterFooter from '#lib/components/ChapterFooter.svelte';
	import ChapterHeader from '#lib/components/ChapterHeader.svelte';
	import Code from '#lib/components/Code.svelte';
	import DeepDive from '#lib/components/DeepDive.svelte';
	import H2 from '#lib/components/H2.svelte';
	import Note from '#lib/components/Note.svelte';
	import { chapter } from '#lib/site.ts';
	import PhaseTimeline from '#lib/widgets/PhaseTimeline.svelte';

	let { data } = $props();
	const c = chapter('metrics');
	const shared = $derived(data.arms.find((a) => a.name === 'shared')!);
	const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
</script>

<svelte:head><title>{c.title} — rsvelte 開発者向けの教材</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="カーネルは、名前を付けた処理の区間（フェーズ）ごとに、使った時間とメモリを確保した回数を数えられます。計測を切ったビルドでは、計測のコードは最適化で消えます。"
/>

<div class="prose-learn">
	<H2 id="alloc" />
	<p>
		<dfn>CountingAllocator</dfn> は、システムのアロケータを包むグローバルアロケータです。バイナリが
		<code>#[global_allocator]</code> で選んだときだけ有効になります。<code>rsvelte</code> の CLI
		は、<code>metrics</code> feature を入れたときに選びます。
	</p>
</div>

<Code item={data.code.alloc} />
<Code item={data.code.counted} />

<div class="prose-learn">
	<p>
		確保の回数とバイト数を、スレッドローカルのカウンタに足します。スレッドローカルなので、並列に走っても競合しません。二つの数は一つの
		<code>Cell</code> に組で入れてあるので、確保 1 回につきスレッドローカルへのアクセスは 1 回です。<code
			>try_with</code
		>
		を使うのは、スレッドの終了処理中（スレッドローカルが破棄されたあと）にも確保が起きうるからです。システムのアロケータが失敗して
		null を返したときは、何も数えません。
	</p>
	<p>
		ゼロで埋めた領域を確保する <code>alloc_zeroed</code> も、システムの実装に転送します。既定の実装は、確保したあとで全バイトにゼロを書き込みます。転送すれば、システムが用意したゼロ埋め済みの領域を使えます。転送しないと、計測機能を入れたビルドだけが遅くなります。
	</p>
	<p>
		確保の回数は、時間と違って、同じ条件なら同じ値になります。1
		スレッドで同じ入力を処理すれば、毎回同じ数です。そのため自動検査では、割り当ての回数とバイト数が記録した値と一致するかを調べます（<a
			href="/learn/measure#ratchet">14 章「性能の基準値との比較検査」</a
		>）<Note>時間はマシンの混み具合で揺れるので、自動検査には向きません。</Note>。
	</p>

	<H2 id="phases" />
	<p>
		<dfn>phase</dfn> は、スコープのあいだの時間と確保を、名前を付けて数えるガードです。<code
			>let _p = measurement::phase("js.print");</code
		>
		と書くと、ブロックを抜けるまでの分が <code>js.print</code> の行に計上されます。
	</p>
</div>

<Code item={data.code.guard} />
<Code item={data.code.notSend} />
<Code item={data.code.phase} />
<Code
	item={data.code.drop}
	mark={[
		'debug_assert_eq!(s.len(), self.depth',
		'parent.child_ns += total_ns;',
		'row.self_ns += total_ns.saturating_sub(f.child_ns);',
		'.position(|r| r.name == f.name)',
	]}
/>

<div class="prose-learn">
	<p>
		ガードはスタックにフレームを積み、スコープを抜けて破棄される（drop
		される）ときに取り出します。そのとき、自分の合計を親フレームの「子の合計」に足します。自分の行には、合計から子の合計を引いた
		<dfn>self</dfn> を足します。そのため、入れ子のフェーズの時間を二重に数えません。全フェーズの self
		の和は、一番外側にある（ほかのフェーズに入っていない）フェーズの合計の和と同じです。
	</p>
	<p>
		フレームはスレッドごとのスタックにあります。そのため、ガードは作ったスレッドで、作ったのと逆の順に破棄する必要があります。<code
			>PhaseGuard</code
		>
		は <code>PhantomData&lt;*const ()&gt;</code> を持つので <code>Send</code>
		でなく、別のスレッドへ渡すコードはコンパイルできません。このことは、下の <code>const _</code>
		でもコンパイル時に確かめています。<code>Send</code>
		なら二つの impl が両方当てはまり、呼び出しが曖昧になってコンパイルが止まります。
	</p>
	<p>
		ガードは作ったときのスタックの深さを覚えています。順番を違えて破棄すると、debug ビルドの <code
			>debug_assert</code
		>
		が失敗します。metrics feature を外したときのガードも <code>Send</code>
		ではありません。もし <code>Send</code> なら、feature なしでは通るコードが feature ありでは通らなくなります。
	</p>
	<p>
		計算結果もタスクもルールも、それぞれ一つのフェーズとして数えます。構文解析の結果は一度だけ計算して共有するので、その時間は、最初に頼んだタスクではなく
		<code>svelte.parse</code>
		に計上されます（<a href="/learn/kernel/database#attribution">04 章</a
		>）。下の図で、タスクの順を入れ替えてみてください。
	</p>
</div>

<PhaseTimeline avg={data.avg} rev={data.benchRev} />

<div class="prose-learn">
	<p>
		行は名前の線形探索で探し、ガードを破棄するたびにそのスレッドの表の <code>Mutex</code>
		も取ります（競合はしません）。ガード 1 回の時間を測ると、およそ半分は計時のための 2 回の時計読みでした。探索とロックの分は測定ではなく見積もりで、metrics
		ビルドの時間の 1% に届きません。フェーズの種類が増えれば効いてきますが、今は単純な形のままにしています（<a
			href="/learn/polish#performance">15 章「磨きどころ」</a
		>）。
	</p>
</div>

<div class="prose-learn">
	<H2 id="merge" />
	<p>
		表はスレッドごとにあり、作られたときに全体のリスト <code>ALL</code> に登録されます。<code
			>snapshot</code
		>
		は全スレッドの表を名前でまとめ、self の大きい順に並べます。終了したスレッドの表は、<code
			>compact</code
		>
		が <code>retired</code> にまとめて残すので、スレッドが終わっても計測は消えません。
	</p>
</div>

<Code item={data.code.snapshot} />

<div class="prose-learn">
	<p>
		全スレッドの時間を足すので、self の合計は経過時間ではなく、スレッド時間の合計です。10 スレッドで
		60 ms 走った処理は、合計で最大 600 ms
		になります。ベンチマークのフェーズ表は、割合として読んでください。
	</p>

	<H2 id="global" />
	<p>
		メモリのピークを知るには、スレッドをまたいだ集計が要ります。<code>track_global(true)</code>
		を呼ぶと、確保と解放のたびに共有のアトミック変数を更新し、生きているヒープの量とその最大値を追います。
	</p>
</div>

<Code item={data.code.trackGlobal} />
<Code item={data.code.global} />

<div class="prose-learn">
	<p>
		アトミック変数を更新すると、すべてのスレッドの確保が同じキャッシュラインを奪い合います。そのためベンチマークは、時間を測るラウンドでは追跡を切り、別のラウンドで割り当てとピークを取ります。
	</p>

	<DeepDive title="ピークは「増分」でしかない">
		<p>
			<code>track_global(true)</code> は生存量を 0
			から数え始めます。追跡を始める前に確保したメモリがあとで解放されると、生存量は負になります。<code
				>global()</code
			>
			は負のピークを 0 に切り上げます。
		</p>
		<p>
			したがってこの値は、プロセスが使ったメモリの最大値ではなく、追跡を始めてからの増分の最大値です。フィールド名が
			<code>peak_live_growth</code> なのはそのためです。プロセス全体の最大値は、別に
			<code>getrusage</code> で最大物理メモリ使用量として取っています。
		</p>
	</DeepDive>

	<H2 id="off" />
	<p>
		<code>metrics</code> feature を外すと、<code>phase</code>
		は何もしない関数になり、ガードは中身のない型になります。<code>#[inline(always)]</code>
		なので、呼び出しごと最適化で消えます。
	</p>
</div>

<Code item={data.code.off} />

<div class="prose-learn">
	<p>
		feature を入れたときのコストも測りました。対象は 14 章のベンチマークの標準の測定条件
		<code>shared</code>（<a href="/learn/measure#arms">14 章</a>）で、ビルドは
		<code>{data.benchRev.slice(0, 10)}</code>
		です。1 ラウンドの時間は、metrics なしで
		{mean(shared.plain).toFixed(1)} ms、ありで {mean(shared.metrics).toFixed(1)}
		ms でした（2 回の実行それぞれの中央値の平均）。差は約
		{((mean(shared.metrics) / mean(shared.plain) - 1) * 100).toFixed(0)}%
		です。そのため、時間の結論は metrics
		なしのビルドで出します。性能の比較検査も同じ分け方です。割り当ては metrics
		ありのビルドで、命令数は metrics なしの出荷用ビルドで数えます。
	</p>
</div>

<ChapterFooter chapter={c} />
