<script lang="ts">
	import Caution from '$lib/components/Caution.svelte';
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import DeepDive from '$lib/components/DeepDive.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import ArtifactCacheSim from '$lib/widgets/ArtifactCacheSim.svelte';

	let { data } = $props();
	const c = chapter('db');
	const ms = (v: number) => v.toFixed(1);
	const m = (v: number) => (v / 1e6).toFixed(2);
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="タスクはパーサを直接呼びません。「パース結果がほしい」と Ctx に頼みます。最初に頼まれたときに計算し、以後は同じ値を返す。このモジュールは、その一つの規則だけでできています。"
/>

<div class="prose-learn">
	<H2 id="artifact" />
	<p>
		<dfn>アーティファクト</dfn>は、文書（と他のアーティファクト）から決まる派生物です。パース結果、解析結果、スコープ付きの
		CSS、型検査用の TypeScript の射影がそうです。トレイトは、出力の型と名前と計算の仕方を決めるだけです。
	</p>
</div>

<Code item={data.code.artifact} />

<div class="prose-learn">
	<p>
		Svelte プラグインの <code>Parsed</code> は、ソースをパースするだけです。パースの失敗も <code>Result</code>
		として値になるので、失敗も一度だけ計算されてキャッシュされます。
	</p>
</div>

<Code item={data.code.parsed} />

<div class="prose-learn">
	<p>
		アーティファクトは別のアーティファクトを求めてかまいません。<code>ScopedCss</code> は <code>Analyzed</code>
		を求め、続けて <code>compile_input</code> でコンパイラの入力を組み立てます。コンポーネントに <code>style</code>
		がなければ <code>None</code> を返します。
	</p>
</div>

<Code item={data.code.scoped} mark={['ctx.get::<Analyzed>()', 'compile_input(ctx)?']} />

<div class="prose-learn">
	<p>
		<code>compile_input</code> 自体はアーティファクトではなく、二つのアーティファクト（スクリプトを持つ <code>Parsed</code> とテンプレートを持つ
		<code>Normalized</code>）から借用を集めて束ねる関数です。コンパイラの解析と出力は、表層の構文木ではなくこの入力だけを読みます。そのため、同じ形の入力を別の構文から組み立てられれば、同じコンパイラが使えます（<a
			href="/learn/kernel/layers#svue">05 svue</a
		>）。
	</p>
</div>

<Code item={data.code.compileInput} mark={['ctx.get::<Normalized>()']} />

<div class="prose-learn">
	<H2 id="registry" />
	<p>
		アーティファクトは型で識別します。登録するときに <code>TypeId</code> を連番の slot 番号に対応させ、<code>Ctx</code>
		はその番号で配列を引きます。同じ型を二回登録しても、二回目は何もしません。
	</p>
</div>

<Code item={data.code.register} />
<Code item={data.code.slot} />

<div class="prose-learn">
	<p>
		登録していないアーティファクトを求めると panic します。これはプラグインの配線ミスで、入力によって起きるものではないからです。
	</p>

	<H2 id="get" />
	<p>
		<code>Ctx</code> は一つの文書に一つ作られ、登録されたアーティファクトの数だけ空の <code>OnceCell</code> を持ちます。
	</p>
</div>

<Code item={data.code.ctx} />
<Code item={data.code.get} />

<div class="prose-learn">
	<p>
		<code>get</code> の中身は三行です。slot を引き、<code>OnceCell::get_or_init</code> で初回だけ計算し、<code
			>Box&lt;dyn Any&gt;</code
		>
		を出力の型に戻します。戻す操作（<code>downcast_ref</code>）が失敗することはありません。slot は型から決まり、その slot
		に入れるのは同じ型の <code>compute</code> の結果だけだからです。
	</p>
	<p>
		計算した順は <code>computed</code> に残ります。テストで「このタスクの組み合わせではパースが一回だった」と確かめるための記録です。
	</p>

	<H2 id="sharing" />
	<p>
		一つの文書で五つのタスクを走らせると、何が何回計算されるでしょうか。下の図で確かめてください。<strong>Shared</strong>
		ではすべてのタスクが一つの <code>Ctx</code> を使い、<strong>Isolated</strong> ではタスクごとに新しい
		<code>Ctx</code> を作ります。
	</p>
</div>

<ArtifactCacheSim />

<div class="prose-learn">
	<p>
		Shared では、パースは最初のタスク（compile/client）が一回だけ行い、残りの四つはキャッシュを読みます。Isolated
		ではタスクの数だけパースします。
	</p>
	<p>
		実測では、{data.docs.toLocaleString('en-US')} 文書に 4 タスク（compile ×2、format、lint）を走らせたとき、Shared の中央値は
		<span class="tnum">{ms(data.shared.plain[0])}</span> ms、Isolated は <span class="tnum">{ms(data.isolated.plain[0])}</span>
		ms でした。割り当て回数は {m(data.isolated.allocs)}M 回から {m(data.shared.allocs)}M 回に減ります<Note
			>時間は metrics なしのビルド、割り当ては metrics ありのビルドの別ラウンドの値です。詳しくは 13 実測の章にあります。</Note
		>。
	</p>

	<DeepDive title="「宣言して計画を立てる」のではない">
		<p>
			実験用の設計メモには「タスクは必要な派生物を宣言し、スケジューラが最小の計画を組む」と書かれています。今の実装はそうなっていません。タスクは何も宣言せず、走りながら
			<code>get</code> を呼び、計算は必要になった時点で起きます。
		</p>
		<p>
			遅延評価のおかげで、コードは単純です。パースに失敗した文書では、解析はそもそも求められません。一方で、走らせる前に「このタスクの組み合わせにはどのアーティファクトが要るか」を知る手段はありません。計画を立てたい（たとえば不要なアーティファクトを持つ文書を先に振り分けたい）なら、宣言を足す必要があります。
		</p>
	</DeepDive>

	<H2 id="cycles" />
	<p>
		<code>ScopedCss</code> の計算中に誰かが <code>ScopedCss</code> を求めると、どうなるでしょうか。<code>OnceCell</code>
		は初期化の再入を検出して panic します。依存の循環はプラグインのバグなので、黙って無限再帰になるより、ここで止まるほうが安全です。
	</p>
	<p>
		<code>Ctx</code> は <code>OnceCell</code> と <code>RefCell</code> を持つので <code>Sync</code>
		ではありません。一つのワーカーが一つの文書を最初から最後まで受け持つので、ロックは要りません。並列化するのは文書の間だけです。
	</p>

	<Caution>
		アーティファクトの出力の型は <code>'static</code> でなければなりません（<code>Box&lt;dyn Any&gt;</code> に入れるため）。そのため、出力は
		<code>Ctx</code> が持つソースを借用できず、必要な文字列は複製するか、位置（Span）で持つことになります。
	</Caution>

	<H2 id="attribution" />
	<p>
		<code>get_or_init</code> の中で、アーティファクトは自分の名前のフェーズを開きます。計測のフェーズは入れ子を除いて数える（排他的）ので、compile/client
		が最初にパースを引き起こしても、パースの時間は <code>svelte.parse</code> に計上され、compile/client の時間には入りません。
	</p>
	<p>
		この規則がないと、パースのコストは「たまたま最初に頼んだタスク」に付いてしまいます。タスクの順番を入れ替えるだけで、どのタスクが遅いかの答えが変わることになります。
	</p>
	<p>
		lint タスクを見ると、タスクの側はアーティファクトを求めているだけだと分かります。求めているのは構文木、名前解決、HIR
		の三つで、どれも別の層です（<a href="/learn/kernel/layers">05</a>）。
	</p>
</div>

<Code item={data.code.lint} mark={['ctx.get::<Parsed>()', '.get::<Resolved>()', '.get::<Normalized>()', 'ctx.line_index()']} />

<div class="prose-learn">
	<p>
		最後の <code>ctx.line_index()</code> はアーティファクトではなく、<code>Ctx</code> が別に持つ
		<code>OnceCell&lt;LineIndex&gt;</code> です。行と列への変換はどの言語でも同じなので、カーネルが直接持っています。lint
		だけでなく、Svelte と Vue の整形器も同じ索引を受け取ります。以前は二つの整形器が自分で索引を作り直していて、共有に変えたときの 1
		ラウンドの命令数は 2,853,755,764 から 2,810,876,017（−1.5%）でした（42b6e550e1）。
	</p>

	<H2 id="facet" />
	<p>
		アーティファクトは、それを定義した言語のものです。Svelte の型検査は Svelte の <code>Parsed</code> を求めればよいのですが、Vue
		を足すと、型検査のタスクがどの言語のアーティファクトを求めればよいかが決まらなくなります。タスクを言語の数だけ書くと、tsc
		の呼び出し、診断の写し戻し、JSON の書き出しという、言語に関係のない部分まで複製することになります。
	</p>
	<p>
		<dfn>ファセット</dfn>（facet）は、この問題のための仕組みです。ファセットは「文書についての問い」で、答え方は言語ごとに違います。トレイトは出力の型と名前だけを決め、<code
			>compute</code
		>
		を持ちません。
	</p>
</div>

<Code item={data.code.facet} />

<div class="prose-learn">
	<p>
		答え方は、言語がレジストリに登録します。<code>provide</code> は言語の ID と、<code>Ctx</code>
		から答えを作る関数を受け取ります。ファセットは、アーティファクトと同じ slot の番号の列に一つ場所を取ります。
	</p>
</div>

<Code item={data.code.provide} />

<div class="prose-learn">
	<p>
		<code>ctx.facet::&lt;F&gt;()</code> は、文書の言語が登録した関数を探し、<code>get</code> と同じ <code>OnceCell</code>
		で一度だけ計算します。その言語がファセットを提供していなければ <code>None</code> です。計測のフェーズもファセットの名前で開くので、答えのコストは求めたタスクではなくファセットに付きます。
	</p>
</div>

<Code item={data.code.ctxFacet} />

<div class="prose-learn">
	<p>
		最初のファセットは <code>rsv_js::check::TsView</code> です。答えは、文書を TypeScript として見たもの、つまり生成した TypeScript（<code
			>Emitter</code
		>）、そこから元の文書へ位置を戻す関数、プロジェクトに足す宣言ファイルです。
	</p>
</div>

<Code item={data.code.tsView} />
<Code item={data.code.tsDoc} />

<div class="prose-learn">
	<p>
		Svelte プラグインは svelte2tsx と同じ形の射影を、Vue プラグインは <code>@vue/language-core</code>
		の仮想コードと同じ形の射影を、このファセットの答えとして登録します。
	</p>
</div>

<Code item={data.code.svelteView} />
<Code item={data.code.svelteRegister} mark={['reg.provide::<TsView>("svelte"']} />
<Code item={data.code.vueRegister} mark={['reg.provide::<TsView>("vue"']} />

<div class="prose-learn">
	<p>
		型検査のタスク <code>rsv_js::check::Check</code> は、ファセットだけを見て書かれています。言語の名前もアーティファクトの名前も出てきません。
	</p>
</div>

<Code item={data.code.prepare} mark={['ctx.facet::<TsView>()?']} />

<div class="prose-learn">
	<p>
		そのため、同じ <code>Check</code> が三つのタスクになります。<code>svelte.check/default</code>（Svelte の文書だけ）、<code
			>vue.check/default</code
		>（Vue の文書だけ）、そして CLI が登録する <code>ts.check/default</code>（両方）です。三つ目は Svelte と Vue
		が混ざったプロジェクトを一回の tsc で検査します。導入したコミットの計測では、30 ユニットで tsc の呼び出しが 2 回から 1 回に、壁時計時間はおよそ 100
		ms から 67 ms になりました（a15cdcda04）。
	</p>
	<p>
		言語ごとの <code>TsProjection</code> というアーティファクトは、このとき廃止されました。ファセットはアーティファクトの代わりではなく、アーティファクトの上に言語ごとの窓口を足すものです。Svelte
		の答えを作る <code>ts_view</code> の中身は、Svelte の <code>Parsed</code> を求める普通のコードです。
	</p>
</div>

<ChapterFooter chapter={c} />
