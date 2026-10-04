<script lang="ts">
	import Term from '$lib/components/Term.svelte';
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
	lead="タスクはパーサを直接呼びません。「パース結果がほしい」と文書ごとの保存領域に頼みます。最初に頼まれたときに計算し、以後は同じ値を返す。このモジュールは、その一つの規則だけでできています。"
/>

<div class="prose-learn">
	<H2 id="artifact" />
	<p>
		<dfn>計算結果</dfn>は、文書（と他の計算結果）から決まる計算結果です。パース結果、解析結果、スコープ付きの
		スタイルシート、型検査用の 型検査用に生成する TypeScript コードがそうです。トレイトは、出力の型と名前と計算の仕方を決めるだけです。
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
		計算結果は別の計算結果を求めてかまいません。Svelte の <code>ScopedStylesheet</code> は <code>Analyzed</code>
		を求め、続けて <code>component_input</code> でコンポーネントの入力を組み立てます。コンポーネントに <code>style</code>
		がなければ <code>None</code> を返します。
	</p>
</div>

<Code item={data.code.scoped} mark={['context.get::<Analyzed>()', 'component_input(context)?']} />

<div class="prose-learn">
	<p>
		<code>component_input</code> 自体は計算結果ではなく、二つの計算結果（スクリプトを持つ <code>Parsed</code> とテンプレートを持つ
		<code>Normalized</code>）から借用を集めて束ねる関数です。コンパイラの解析と出力は、表層の構文木ではなくこの入力だけを読みます。そのため、同じ形の入力を別の構文から組み立てられれば、同じコンパイラが使えます（<a
			href="/learn/kernel/layers#svue">05 svue</a
		>）。
	</p>
</div>

<Code item={data.code.compileInput} mark={['context.get::<Normalized>()']} />

<div class="prose-learn">
	<H2 id="registry" />
	<p>
		計算結果は型で識別します。登録するときに <code>TypeIdentifier</code> を配列の位置に対応させ、<Term name="DocumentContext" />
		はその番号で配列を引きます。同じ型を二回登録しても、二回目は何もしません。
	</p>
</div>

<Code item={data.code.register} />
<Code item={data.code.slot} />

<div class="prose-learn">
	<p>
		登録していない計算結果を求めると panic します。これはプラグインの配線ミスで、入力によって起きるものではないからです。
	</p>

	<H2 id="get" />
	<p>
		<Term name="DocumentContext" /> は一つの文書に一つ作られ、登録された計算結果の数だけ空の <code>OnceCell</code> を持ちます。
	</p>
</div>

<Code item={data.code.context} />
<Code item={data.code.get} />

<div class="prose-learn">
	<p>
		<code>get</code> の中身は三行です。配列の位置を引き、<code>OnceCell::get_or_init</code> で初回だけ計算し、<code
			>Box&lt;dyn Any&gt;</code
		>
		を出力の型に戻します。戻す操作（<code>downcast_ref</code>）が失敗することはありません。配列の位置は型から決まり、その 配列の位置
		に入れるのは同じ型の <code>compute</code> の結果だけだからです。
	</p>
	<p>
		<code>trace-artifacts</code> という feature を有効にしたときだけ、計算した順が <code>computed</code> に残ります。テストで「このタスクの組み合わせではパースが一回だった」と確かめるための記録です。
	</p>

	<H2 id="sharing" />
	<p>
		下の図は Svelte の文書に五つのタスクを選ぶモデルです。計算結果の種類と依存関係は、この言語プラグインの例です。<strong>計算結果を共有する場合</strong>
		ではすべてのタスクが一つの <Term name="DocumentContext" /> を使い、<strong>タスクごとに計算する場合</strong> ではタスクごとに新しい
		<Term name="DocumentContext" /> を作ります。
	</p>
</div>

<ArtifactCacheSim />

<div class="prose-learn">
	<p>
		このモデルで全タスクを選び、構文解析に成功した場合は、最初のタスクが一回だけ解析し、残りは保存した結果を読みます。
		別の言語でも、同じ型の計算結果を求めるタスクはこの仕組みで共有できます。タスクごとに計算する場合は、保存領域を共有しません。
	</p>
	<p>
		実測では、{data.docs.toLocaleString('en-US')} 文書を二種類のコンパイルで処理し、整形とコード検査もかけました。計算結果を共有する場合の時間の中央値は
		<span class="tnum">{ms(data.shared.plain[0])}</span> ms、タスクごとに計算する場合 は <span class="tnum">{ms(data.isolated.plain[0])}</span>
		ms でした。割り当て回数は {m(data.isolated.allocations)}M 回から {m(data.shared.allocations)}M 回に減ります<Note
			>時間は metrics なしのビルド、割り当ては metrics ありのビルドの別ラウンドの値です。詳しくは 13 実測の章にあります。</Note
		>。
	</p>

	<DeepDive title="「宣言して計画を立てる」のではない">
		<p>
			実験用の設計メモには「タスクは必要な計算結果を宣言し、スケジューラが最小の計画を組む」と書かれています。今の実装はそうなっていません。タスクは何も宣言せず、走りながら
			<code>get</code> を呼び、計算は必要になった時点で起きます。
		</p>
		<p>
			遅延評価のおかげで、コードは単純です。パースに失敗した文書では、解析はそもそも求められません。一方で、走らせる前に「このタスクの組み合わせにはどの計算結果が要るか」を知る手段はありません。計画を立てたい（たとえば不要な計算結果を持つ文書を先に振り分けたい）なら、宣言を足す必要があります。
		</p>
	</DeepDive>

	<H2 id="cycles" />
	<p>
		<code>ScopedStylesheet</code> の計算中に誰かが <code>ScopedStylesheet</code> を求めると、どうなるでしょうか。<code>OnceCell</code>
		は初期化の再入を検出して panic します。依存の循環はプラグインのバグなので、黙って無限再帰になるより、ここで止まるほうが安全です。
	</p>
	<p>
		<Term name="DocumentContext" /> は <code>OnceCell</code> を持つので <code>Sync</code>
		ではありません。一つのワーカーが一つの文書を最初から最後まで受け持つので、ロックは要りません。並列化するのは文書の間だけです。
	</p>

	<Caution>
		計算結果の出力の型は <code>'static</code> でなければなりません（<code>Box&lt;dyn Any&gt;</code> に入れるため）。そのため、出力は
		<Term name="DocumentContext" /> が持つソースを借用できず、必要な文字列は複製するか、位置（Span）で持つことになります。
	</Caution>

	<H2 id="attribution" />
	<p>
		<code>get_or_init</code> の中で、計算結果の種類ごとに処理時間を測ります。内側で呼び出した別の処理の時間は差し引きます。
		たとえば Svelte のブラウザ向けコンパイルが構文解析を呼び出した場合でも、構文解析の時間は <code>svelte.parse</code> として記録します。
		その時間はコンパイルの時間に含めません。
	</p>
	<p>
		この規則がないと、パースのコストは「たまたま最初に頼んだタスク」に付いてしまいます。タスクの順番を入れ替えるだけで、どのタスクが遅いかの答えが変わることになります。
	</p>
	<p>
		Svelte の lint のルール <code>svelte/valid-each-key</code> を実装例として見ると、ルールの側は計算結果を求めているだけだと分かります。求めているのは構文木、コンパイル用に整理した構文木、名前解決
		の三つで、どれも別の層です（<a href="/learn/kernel/layers">05</a>）。
	</p>
</div>

<Code item={data.code.eachKey} mark={['.get::<Parsed>()', '.get::<Normalized>()', '.get::<Resolved>()']} />

<div class="prose-learn">
	<p>
		lint のタスクの本体 <code>Lint::run</code> は、指摘を構造化データ形式にするときに <code>context.line_index()</code> を使います。
	</p>
</div>

<Code item={data.code.lint} mark={['context.line_index()']} />

<div class="prose-learn">
	<p>
		<code>context.line_index()</code> は計算結果ではなく、<Term name="DocumentContext" /> が別に持つ
		<code>OnceCell&lt;LineIndex&gt;</code> です。行と列への変換はどの言語でも同じなので、カーネルが直接持っています。lint
		だけでなく、Svelte と Vue の整形器も同じ索引を受け取ります。以前は二つの整形器が自分で索引を作り直していて、共有に変えたときの 1
		ラウンドの命令数は 2,853,755,764 から 2,810,876,017（−1.5%）でした（42b6e550e1）。
	</p>

	<H2 id="facet" />
	<p>
		構文木や解析結果の型は、言語ごとに異なります。複数の言語を扱う型検査タスクが一つの言語の構文木だけを求めると、他の言語を処理できません。タスクを言語の数だけ書くと、tsc
		の呼び出し、診断の写し戻し、構造化データ形式の書き出しという、言語に関係のない部分まで複製することになります。
	</p>
	<p>
		<dfn>共通の呼び出し窓口</dfn>（facet）は、この問題のための仕組みです。共通の呼び出し窓口は「文書についての問い」で、答え方は言語ごとに違います。トレイトは出力の型と名前だけを決め、<code
			>compute</code
		>
		を持ちません。
	</p>
</div>

<Code item={data.code.facet} />

<div class="prose-learn">
	<p>
		答え方は、プラグインがレジストリに登録します。<code>provide</code> は提供元の識別番号、処理対象の文書を選ぶ判定関数と、<Term name="DocumentContext" />
		から答えを作る関数を受け取ります。共通窓口から取得した結果も、ほかの計算結果と同じ配列に保存します。
	</p>
</div>

<Code item={data.code.provide} />

<div class="prose-learn">
	<p>
		<code>context.facet::&lt;F&gt;()</code> は、対象文書に一致する判定関数を持つ提供元を探し、<code>get</code> と同じ <code>OnceCell</code>
		で一度だけ計算します。一致する提供元がなければ <code>None</code> です。同じ窓口に複数の提供元が一致した場合は、登録順で選ばず異常終了します。
		計算にかかった時間は、要求したタスクではなく、呼び出した窓口の名前で記録します。
	</p>
</div>

<Code item={data.code.contextFacet} />

<div class="prose-learn">
	<p>
		最初の共通の呼び出し窓口は <Term name="rsvelte_typescript_check::TypeScriptView" /> です。答えは、文書を TypeScript として見たもの、つまり生成した TypeScript（<code
			>Emitter</code
		>）、元の文書へ位置を戻す方法、プロジェクトに足す設定と宣言ファイルです。Svelte は位置を戻す仕事を TypeScript の content mapper に任せ、Vue は位置を戻す関数を渡します。
	</p>
</div>

<Code item={data.code.typescriptView} />
<Code item={data.code.typescriptDocument} />

<div class="prose-learn">
	<p>
		Svelte プラグインは、svelte-check が検査するのと同じ型の情報を持つ TypeScript を生成します。svelte2tsx と同じ文字列は目指していません。Vue プラグインは <code>@vue/language-core</code> と同じ形のコードを生成します。
		どちらも、生成したコードを共通の呼び出し窓口から返すように登録します。
	</p>
</div>

<Code item={data.code.svelteView} />
<Code item={data.code.svelteRegister} mark={['reg.provide::<TypeScriptView>("svelte"']} />
<Code item={data.code.vueRegister} mark={['reg.provide::<TypeScriptView>("vue"']} />

<div class="prose-learn">
	<p>
		型検査のタスク <code>rsvelte_typescript_check::Check</code> は、共通の呼び出し窓口だけを見て書かれています。言語の名前も計算結果の名前も出てきません。
	</p>
</div>

<Code item={data.code.prepare} mark={['context.facet::<TypeScriptView>()?']} />

<div class="prose-learn">
	<p>
		同じ型検査処理を、三つのタスクとして登録できます。Svelte だけを調べる処理と、Vue だけを調べる処理があります。
		コマンドラインの実行プログラムは、TypeScript・Svelte・Vue をまとめて調べる処理も登録します。
		これにより、Svelte と Vue が混ざったプロジェクトを TypeScript のコンパイラで一度に検査できます。
		導入時の計測では、30 検証例に対するコンパイラの呼び出しが2回から1回に減りました。実行時間はおよそ100 msから67 msになりました（a15cdcda04）。
	</p>
	<p>
		言語ごとの <code>TypeScriptProjection</code> という計算結果は、このとき廃止されました。共通の呼び出し窓口は計算結果の代わりではなく、計算結果の上に言語ごとの窓口を足すものです。Svelte
		の答えを作る <code>typescript_view</code> の中身は、Svelte の <code>Parsed</code> を求める普通のコードです。
	</p>
</div>

<ChapterFooter chapter={c} />
