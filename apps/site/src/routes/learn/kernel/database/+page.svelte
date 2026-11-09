<script lang="ts">
	import Caution from '#lib/components/Caution.svelte';
	import ChapterFooter from '#lib/components/ChapterFooter.svelte';
	import ChapterHeader from '#lib/components/ChapterHeader.svelte';
	import Code from '#lib/components/Code.svelte';
	import DeepDive from '#lib/components/DeepDive.svelte';
	import H2 from '#lib/components/H2.svelte';
	import Note from '#lib/components/Note.svelte';
	import { chapter } from '#lib/site.ts';
	import ArtifactCacheSim from '#lib/widgets/ArtifactCacheSim.svelte';

	let { data } = $props();
	const c = chapter('db');
	const ms = (v: number) => v.toFixed(1);
	const m = (v: number) => (v / 1e6).toFixed(2);
</script>

<svelte:head><title>{c.title} — rsvelte 開発者向けの教材</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="タスクはパーサを直接呼ばず、文書ごとの保存領域にパース結果を求めます。計算結果は初めて求められたときに計算し、以後は保存した値を返します。"
/>

<div class="prose-learn">
	<H2 id="artifact" />
	<p>
		<dfn>計算結果</dfn
		>は、文書と他の計算結果だけから決まる値です。パース結果、解析結果、スコープ付きのスタイルシート、型検査用に生成する
		TypeScript コードがその例です。<code>Artifact</code> トレイトは、出力の型、名前、計算の仕方だけを決めます。
	</p>
</div>

<Code item={data.code.artifact} />

<div class="prose-learn">
	<p>
		Svelte プラグインの <code>Parsed</code> は、ソースをパースするだけです。パースの失敗も
		<code>Result</code>
		の値になるので、失敗も一度だけ計算してキャッシュします。
	</p>
</div>

<Code item={data.code.parsed} />

<div class="prose-learn">
	<p>
		計算結果の中から、別の計算結果を求めることもできます。Svelte の <code>ScopedStylesheet</code>
		は、<code>Analyzed</code>、<code>Validated</code>、<code>Identified</code>
		を求めます。コンポーネントの入力は
		<code>component_input</code> で作ります。スタイルがなければ <code>None</code> を返します。
	</p>
</div>

<Code item={data.code.scoped} mark={['context.get::<Analyzed>()', 'component_input(context)?']} />

<div class="prose-learn">
	<p>
		<code>component_input</code> は計算結果ではありません。スクリプトを持つ <code>Parsed</code>
		と、テンプレートを持つ
		<code>Lowered</code
		>（コンパイル用に整理した構文木）から借用を集めて束ねる関数です。コンパイラの解析と出力は、表層の構文木（ソースの書き方をそのまま写した木）ではなく、この入力だけを読みます。そのため、同じ形の入力を別の構文から組み立てれば、同じコンパイラを使えます。svue
		は、この仕組みで Vue のファイルを Svelte のコンパイラでコンパイルします（<a
			href="/learn/kernel/layers#svue">05 章</a
		>）。
	</p>
</div>

<Code item={data.code.compileInput} mark={['context.get::<Lowered>()']} />

<div class="prose-learn">
	<H2 id="registry" />
	<p>
		計算結果は型で見分けます。登録するときに、型の識別子 <code>TypeIdentifier</code>（Rust の
		<code>TypeId</code>）をスロットに対応させます。スロットは配列の要素の番号です。<code
			>DocumentContext</code
		>
		は、この番号で配列を引きます。同じ型を二回登録しても、二回目は何もしません。
	</p>
</div>

<Code item={data.code.register} />
<Code item={data.code.slot} />

<div class="prose-learn">
	<p>
		登録していない計算結果を求めると panic
		します。これはプラグインの配線の誤りで、入力によって起きるものではないからです。
	</p>

	<H2 id="get" />
	<p>
		<code>DocumentContext</code>
		は、一つの文書の計算結果を置く保存領域です。文書一つにつき一つ作り、登録された計算結果の数だけ空の
		<code>OnceCell</code> を持ちます。
	</p>
</div>

<Code item={data.code.context} />
<Code item={data.code.get} />

<div class="prose-learn">
	<p>
		<code>get</code> がすることは三つです。スロットを引き、<code>OnceCell::get_or_init</code>
		で初回だけ計算し、<code>Box&lt;dyn Any&gt;</code> を出力の型に戻します。戻す操作（<code
			>downcast_ref</code
		>）は失敗しません。スロットは型から決まり、そのスロットに入るのは同じ型の
		<code>compute</code> の結果だけだからです。
	</p>
	<p>
		<code>trace-artifacts</code> という feature
		を有効にしたときだけ、記録が二つ残ります。計算した順の <code>computed</code>
		と、各要求がキャッシュから返ったかを示す <code>accesses</code> です。テストで「このタスクの組み合わせではパースが一回だった」と確かめるための記録です。
	</p>
	<p>
		タスクの側は、計算結果を求めるだけです。Svelte のコード検査のルール <code
			>svelte/valid-each-key</code
		>
		は、構文木、コンパイル用に整理した構文木、名前解決の三つを求めます。どれも構文木の上に重ねた別々の層です（<a
			href="/learn/kernel/layers">05 章</a
		>）。
	</p>
</div>

<Code
	item={data.code.eachKey}
	mark={['.get::<Parsed>()', '.get::<Lowered>()', '.get::<Resolved>()']}
/>

<div class="prose-learn">
	<p>
		コード検査のタスクの本体 <code>Lint::run</code> は、指摘を JSON で書き出すときに
		<code>context.line_index()</code> を使います。
	</p>
</div>

<Code item={data.code.lint} mark={['context.line_index()']} />

<div class="prose-learn">
	<p>
		<code>context.line_index()</code> が返す
		<code>LineIndex</code>（バイト位置を行と列に直す表）は、計算結果ではありません。<code
			>DocumentContext</code
		>
		が別の <code>OnceCell</code>
		で持ちます。行と列への変換はどの言語でも同じなので、カーネルが直接持ちます。コード検査のほか、Svelte
		と Vue の整形器も同じ表を受け取ります。以前は二つの整形器がそれぞれ表を作っていました。共有に変えると、ベンチマークの
		1 ラウンドの命令数は 2,853,755,764 から 2,810,876,017 に減りました（−1.5%）。1 ラウンドは、全ファイルを一回処理する測定です（<a
			href="/learn/measure">14 章</a
		>）。
	</p>

	<H2 id="sharing" />
	<p>
		下の図は、Svelte
		の文書に五つのタスクを選んだときのモデルです。計算結果の種類と依存関係は、Svelte
		プラグインのものです。計算結果を共有する場合は、すべてのタスクが一つの <code
			>DocumentContext</code
		>
		を使います。タスクごとに計算する場合は、タスクごとに新しい <code>DocumentContext</code> を作ります。
	</p>
</div>

<ArtifactCacheSim />

<div class="prose-learn">
	<p>
		全タスクを選んでパースが成功すると、最初のタスクが一回だけ構文解析し、残りは保存した結果を読みます。
	</p>
	<p>
		ベンチマークでは、{data.docs.toLocaleString('en-US')} 文書を二種類のコンパイル、整形、コード検査で処理しました。共有するかどうかは
		rsvelte 自身の測定条件で、ほかのツールとの比較ではありません。全文書を一回処理する時間（1 ラウンド、中央値）は、共有する場合が
		<span class="tnum">{ms(data.shared.plain[0])}</span> ms、タスクごとに計算する場合が
		<span class="tnum">{ms(data.isolated.plain[0])}</span>
		ms でした。1 ラウンドのメモリ割り当て回数は、共有する場合が {m(data.shared.allocations)}M
		回、タスクごとに計算する場合が
		{m(data.isolated.allocations)}M 回です<Note
			>時間は metrics なしのビルドで、割り当ては metrics
			ありのビルドで、別々のラウンドに測った値です（<a href="/learn/measure">14 章</a>）。</Note
		>。
	</p>

	<DeepDive title="タスクは必要な計算結果を宣言しない">
		<p>
			タスクが必要な計算結果を先に宣言し、スケジューラが計画を組む設計もあります。今の実装はそうしていません。タスクは何も宣言せず、走りながら
			<code>get</code> を呼びます。計算は必要になった時点で起きます。
		</p>
		<p>
			この遅延評価で、コードは単純になります。パースに失敗した文書では、解析はそもそも求められません。その代わり、走らせる前に「このタスクの組み合わせにはどの計算結果が要るか」を知る方法はありません。それを知りたくなったら、宣言を足す必要があります。
		</p>
	</DeepDive>

	<H2 id="cycles" />
	<p>
		<code>ScopedStylesheet</code> の計算中に、誰かが <code>ScopedStylesheet</code>
		を求めるとどうなるでしょうか。<code>OnceCell</code> は初期化の再入を検出して panic します。依存の循環はプラグインのバグなので、無限に再帰せずにここで止めます。
	</p>
	<p>
		<code>DocumentContext</code> は <code>OnceCell</code> を持つので、<code>Sync</code>
		ではありません。一つのワーカーが一つの文書を最初から最後まで受け持つので、ロックは要りません。並列化するのは文書の間だけです。
	</p>

	<Caution>
		計算結果の出力の型は、<code>Box&lt;dyn Any&gt;</code> に入れるため <code>'static</code>
		でなければなりません。そのため、出力は
		<code>DocumentContext</code> が持つソースを借用できません。必要な文字列は、複製するか位置（<code
			>Span</code
		>）で持ちます。
	</Caution>

	<H2 id="attribution" />
	<p>
		<code>get_or_init</code>
		の中で、計算結果の種類ごとに処理時間を測ります。内側で呼んだ別の処理の時間は差し引きます。たとえば
		Svelte のブラウザ向けコンパイルが構文解析を呼んでも、構文解析の時間は <code>svelte.parse</code>
		として記録し、コンパイルの時間には含めません。
	</p>
	<p>
		この規則がないと、パースの時間が、たまたま先に求めたタスクの時間に入ります。タスクの順番を入れ替えるだけで、どのタスクが遅いかの答えが変わってしまいます。
	</p>

	<H2 id="facet" />
	<p>
		構文木や解析結果の型は、言語ごとに違います。複数の言語を扱う型検査タスクが一つの言語の構文木だけを求めると、他の言語を扱えません。タスクを言語の数だけ書くと、型検査器の呼び出し、診断の位置の戻し、JSON
		の書き出しといった、言語に関係ない部分まで複製することになります。
	</p>
	<p>
		<dfn>共通の呼び出し窓口</dfn
		>（facet）は、このための仕組みです。共通の呼び出し窓口は文書についての問いで、答え方は言語ごとに違います。<code
			>Facet</code
		>
		トレイトは出力の型と名前だけを決め、<code>compute</code> を持ちません。
	</p>
</div>

<Code item={data.code.facet} />

<div class="prose-learn">
	<p>
		答え方は、プラグインがレジストリに登録します。<code>provide</code>
		は、提供元の名前、処理対象の文書を選ぶ判定関数、<code>DocumentContext</code>
		から答えを作る関数を受け取ります。窓口の答えも、ほかの計算結果と同じ配列に保存します。
	</p>
</div>

<Code item={data.code.provide} />

<div class="prose-learn">
	<p>
		<code>context.facet::&lt;F&gt;()</code> は、判定関数が対象の文書に一致する提供元を探し、<code
			>get</code
		>
		と同じ <code>OnceCell</code> で一度だけ計算します。一致する提供元がなければ <code>None</code> です。複数の提供元が一致したときは、登録順で選ばずに
		panic します。計算時間は、求めたタスクではなく窓口の名前で記録します。
	</p>
</div>

<Code item={data.code.contextFacet} />

<div class="prose-learn">
	<p>
		最初の共通の呼び出し窓口は、<code>rsvelte_typescript_check</code> の <code>TypeScriptView</code>
		です。答えは文書を TypeScript として見たものです。生成した TypeScript（<code>Emitter</code
		>）、元の文書へ位置を戻す関数（<code>map_back</code
		>）、プロジェクトに足す設定と宣言ファイル（<code>env</code>）からなります。
	</p>
	<p>
		位置の戻し方は言語で違います。Svelte は、設定で content mapper を渡します。content mapper
		は、型検査器が生成コードの位置を元の
		<code>.svelte</code>
		ファイルに戻す仕組みです。そのため、型検査器が返す位置はすでに元のファイルの位置です。このとき
		<code>map_back</code> は使いません。Vue は <code>map_back</code> の関数で位置を戻します。
	</p>
</div>

<Code item={data.code.typescriptView} />
<Code item={data.code.typescriptDocument} />

<div class="prose-learn">
	<p>
		Svelte プラグインは、svelte-check が検査するのと同じ型の情報を持つ TypeScript
		を生成します。svelte2tsx と同じ文字列は目指していません。Vue プラグインは <code
			>@vue/language-core</code
		>
		と同じ形のコードを生成します。どちらも、生成したコードを共通の呼び出し窓口から返すように登録します。
	</p>
</div>

<Code item={data.code.svelteView} />
<Code item={data.code.svelteRegister} mark={['reg.provide::<TypeScriptView>("svelte"']} />
<Code item={data.code.vueRegister} mark={['reg.provide::<TypeScriptView>("vue"']} />

<div class="prose-learn">
	<p>
		型検査のタスク <code>rsvelte_typescript_check::Check</code>
		は、共通の呼び出し窓口だけを見て書かれています。言語の名前も計算結果の名前も出てきません。
	</p>
</div>

<Code item={data.code.prepare} mark={['context.facet::<TypeScriptView>()?']} />

<div class="prose-learn">
	<p>
		同じ型検査処理を、三つのタスクとして登録できます。<code>svelte.check/default</code> は Svelte
		だけを、<code>vue.check/default</code> は Vue だけを調べます。<code>ts.check/default</code>
		は、拡張機能 <code>typescript.check</code>
		が登録するタスクです。型検査器のコマンドは、この拡張機能の設定で指定します。窓口が答えるすべての文書（TypeScript、Svelte、Vue）を、TypeScript
		のコンパイラで一度に検査します。窓口を入れたときの計測では、30 の検証例でコンパイラの呼び出しが 2
		回から 1 回に減りました。実行時間は、およそ 100 ms から 67 ms になりました。
	</p>
	<p>
		窓口の答えを作るコードは、ふつうに計算結果を求めます。Svelte の答えを作る <code
			>typescript_view</code
		>
		は、Svelte の <code>Parsed</code> と <code>Printed</code> を求めます。<code>Printed</code>
		は、生成した TypeScript を持つ計算結果です。以前あった言語ごとの
		<code>TypeScriptProjection</code>
		という計算結果は、窓口を入れたときに廃止しました。
	</p>
</div>

<ChapterFooter chapter={c} />
