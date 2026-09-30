<script lang="ts">
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import DeepDive from '$lib/components/DeepDive.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import PhaseTimeline from '$lib/widgets/PhaseTimeline.svelte';

	let { data } = $props();
	const c = chapter('metrics');
	const shared = $derived(data.arms.find((a) => a.name === 'shared')!);
	const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="性能の議論は、測れて初めて始まります。カーネルは、どのフェーズが時間を使い、何回メモリを確保したかを、最初から数えられるように作られています。使わないときは、計測のコードは一行も残りません。"
/>

<div class="prose-learn">
	<H2 id="alloc" />
	<p>
		<dfn>CountingAlloc</dfn> は、システムのアロケータを包むグローバルアロケータです。バイナリが <code>#[global_allocator]</code>
		で選んだときだけ有効になります（<code>rsv</code> CLI は <code>metrics</code> feature のときに選びます）。
	</p>
</div>

<Code item={data.code.alloc} />
<Code item={data.code.counted} />

<div class="prose-learn">
	<p>
		確保の回数とバイト数を、スレッドローカルのカウンタに足します。スレッドローカルなので、並列に走っていても競合しません。二つの数は一つの
		<code>Cell</code> に組で入れてあり、確保一回につきスレッドローカルへのアクセスは一回です。<code>try_with</code>
		を使うのは、スレッドの終了処理中（スレッドローカルがもう破棄されたあと）にも確保が起きうるからです。システムのアロケータが失敗したとき（null
		が返ったとき）は何も数えません。
	</p>
	<p>
		<code>alloc_zeroed</code> も転送しています。<code>GlobalAlloc</code> の既定の <code>alloc_zeroed</code> は <code>alloc</code>
		を呼んでから全バイトに 0 を書くので、転送しないと <code>vec![0; n]</code> が <code>calloc</code> の「最初から 0 のページ」を使えなくなり、metrics
		ありのビルドだけが遅くなります（2f8bef970a）。
	</p>
	<p>
		時間と違って、確保の回数は決定的です。1 スレッドで同じ入力を処理すれば、毎回同じ数になります。そのため CI は、割り当ての回数とバイト数を記録した値と<strong>完全に一致</strong>するかで比べています（<a
			href="/learn/measure#ratchet">13 性能のラチェット</a
		>）<Note>時間はマシンの混み具合で揺れるので、CI の門番には向きません。</Note>。
	</p>

	<H2 id="phases" />
	<p>
		<dfn>phase</dfn> は、スコープの間の時間と確保を名前付きで数えるガードです。<code>let _p = metrics::phase("js.print");</code>
		と書けば、そのブロックを抜けるまでが <code>js.print</code> に計上されます。
	</p>
</div>

<Code item={data.code.guard} />
<Code item={data.code.notSend} />
<Code item={data.code.phase} />
<Code item={data.code.drop} mark={['debug_assert_eq!(s.len(), self.depth', 'parent.child_ns += total_ns;', 'row.self_ns += total_ns.saturating_sub(f.child_ns);', '.position(|r| r.name == f.name)']} />

<div class="prose-learn">
	<p>
		ガードが落ちるとき、自分の合計を親フレームの「子の合計」に足し、自分の行には合計から子の合計を引いた <dfn>self</dfn>
		を足します。つまりフェーズは<strong>排他的</strong>です。すべてのフェーズの self を足すと、一番外側のフェーズの合計になります。
	</p>
	<p>
		ガードはスレッドのスタックからフレームを取り出すので、作ったスレッドで、作った逆の順に落とさなければなりません。そこで <code>PhaseGuard</code>
		は <code>Send</code> でない型（<code>PhantomData&lt;*const ()&gt;</code> を持つ）にしてあり、別のスレッドへ渡すコードはコンパイルが通りません。<code
			>Send</code
		>
		でないことはコンパイル時の検査でも固定しています（下の <code>const _</code>。<code>Send</code> なら二つの impl が両方当てはまり、呼び出しが曖昧になってコンパイルが止まります）。ガードは作ったときのスタックの深さを覚えていて、順番を違えて落とすと debug
		ビルドの <code>debug_assert</code> が落ちます。metrics feature を外したときのガードも <code>Send</code> でない型にしてあり、feature
		なしでコンパイルが通るコードは feature ありでも通ります。
	</p>
	<p>
		アーティファクトもタスクもルールもフェーズなので、パースは、それを最初に頼んだタスクではなく <code>svelte.parse</code>
		に計上されます（<a href="/learn/kernel/db#attribution">04</a>）。下の図で、タスクの順を入れ替えてみてください。
	</p>
</div>

<PhaseTimeline avg={data.avg} rev={data.benchRev} />

<div class="prose-learn">
	<p>
		行を探すのは名前の線形探索で、ガードが落ちるたびにそのスレッドの表の <code>Mutex</code>
		も取ります（競合はしません）。測ると、ガード一回の時間のおよそ半分は計時のための二回の時計読みで、探索とロックの分は metrics
		ビルドの時間の 1% に届かない見積もりでした。フェーズの種類が増えれば効いてきますが、今は単純な形のままにしています（<a
			href="/learn/polish#performance">14 磨きどころ</a
		>）。
	</p>
</div>

<div class="prose-learn">
	<H2 id="merge" />
	<p>
		表はスレッドごとにあり、作られたときに全体のリスト <code>ALL</code> に登録されます。<code>snapshot</code>
		は全スレッドの表を名前でまとめ、self の大きい順に並べます。
	</p>
</div>

<Code item={data.code.snapshot} />

<div class="prose-learn">
	<p>
		すべてのスレッドの時間を足すので、self の合計は壁時計の時間ではなく、スレッド時間の合計です。10 スレッドで 60 ms
		走った処理は、合計で最大 600 ms になります。ベンチマークのフェーズ表を読むときは、割合として読んでください。
	</p>

	<H2 id="global" />
	<p>
		メモリのピークを知るには、スレッドをまたいだ集計が要ります。<code>track_global(true)</code> をすると、確保と解放のたびに共有のアトミック変数を更新し、生存しているヒープの量とその最大値を追いかけます。
	</p>
</div>

<Code item={data.code.trackGlobal} />
<Code item={data.code.global} />

<div class="prose-learn">
	<p>
		アトミック変数の更新は、すべてのスレッドの確保でキャッシュラインを奪い合います。そのためベンチマークは、時間を測るラウンドでは追跡を切り、別のラウンドで割り当てとピークを取ります。
	</p>

	<DeepDive title="ピークは「増分」でしかない">
		<p>
			<code>track_global(true)</code> は生存量を 0 から数え始めます。追跡を始める前に確保されたメモリがその後で解放されると、生存量は負になります。<code
				>global()</code
			>
			は負のピークを 0 に切り上げます。
		</p>
		<p>
			したがってこの値は「プロセスが使ったメモリの最大値」ではなく、「追跡を始めた時点からの増分の最大値」です。フィールド名が
			<code>peak_live_growth</code> なのはそのためです。プロセス全体の最大値は、別に <code>getrusage</code> の最大 RSS で取っています。
		</p>
	</DeepDive>

	<H2 id="off" />
	<p>
		<code>metrics</code> feature を外すと、<code>phase</code> は何もしない関数になり、ガードは中身のない型になります。<code
			>#[inline(always)]</code
		>
		なので、呼び出しも含めて最適化で消えます。
	</p>
</div>

<Code item={data.code.off} />

<div class="prose-learn">
	<p>
		feature を入れたときのコストは測ってあります。ビルド <code>{data.benchRev.slice(0, 10)}</code> の <code>shared</code> アームの中央値は、metrics
		なしのビルドで {mean(shared.plain).toFixed(1)} ms、ありのビルドで {mean(shared.metrics).toFixed(1)} ms（それぞれ 2 回の平均）でした。約
		{((mean(shared.metrics) / mean(shared.plain) - 1) * 100).toFixed(0)}% です。そのため、時間の結論は metrics なしのビルドで出します。性能のラチェットも同じ分け方をしていて、割り当ては
		metrics ありのビルドで、命令数は metrics なしの出荷用ビルドで数えます。
	</p>
</div>

<ChapterFooter chapter={c} />
