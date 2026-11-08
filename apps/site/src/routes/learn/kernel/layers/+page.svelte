<script lang="ts">
	import Caution from '#lib/components/Caution.svelte';
	import ChapterFooter from '#lib/components/ChapterFooter.svelte';
	import ChapterHeader from '#lib/components/ChapterHeader.svelte';
	import Code from '#lib/components/Code.svelte';
	import DeepDive from '#lib/components/DeepDive.svelte';
	import H2 from '#lib/components/H2.svelte';
	import Note from '#lib/components/Note.svelte';
	import { chapter } from '#lib/site.ts';
	import LayerView from '#lib/widgets/LayerView.svelte';

	let { data } = $props();
	const c = chapter('layers');

	const stack = [
		{
			name: 'svelte.parse',
			layer: '元の構文木',
			what: '書かれたとおりの木。整形はこれだけを読む。',
			readers: 'すべて',
		},
		{
			name: 'svelte.compiler_syntax_tree',
			layer: 'コンパイル用に整理した構文木',
			what: 'コンパイラが理解する形のテンプレート。',
			readers: 'compile, lint',
		},
		{
			name: 'svelte.resolve',
			layer: '名前解決',
			what: 'スコープ、名前から束縛への対応、rune の種類。コンパイル用に整理した構文木を読む。',
			readers: 'compile, lint',
		},
		{
			name: 'svelte.analyze',
			layer: 'コンパイラの解析',
			what: '式の依存、動的な断片、スタイルシートが選ぶ要素。コンパイル用に整理した構文木と名前解決を読む。',
			readers: 'compile',
		},
		{
			name: 'svelte.css',
			layer: '出力',
			what: 'スコープを付けたスタイルシート。',
			readers: 'compile',
		},
		{
			name: 'ts.view',
			layer: '出力（共通の呼び出し窓口）',
			what: '型検査が読む TypeScript。Svelte の文書の分は、元の構文木から作る。',
			readers: 'check',
		},
	];
</script>

<svelte:head><title>{c.title} — rsvelte 開発者向けの教材</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="構文解析した木は、書かれたとおりの形をしています。コード検査や型検査が知りたいのは、それが何を意味するかです。元の構文木から、コンパイル用に整理した構文木と名前解決の層を作り、ルールやツールが必要な層だけを読む仕組みを説明します。"
/>

<div class="prose-learn">
	<H2 id="why" />
	<p>
		構文だけを調べる検査と、意味も調べる検査では、必要な情報が違います。たとえば <code
			>no-unused-vars</code
		> は、どの識別子がどの宣言を指すか（名前解決）を知る必要があります。名前解決はコンパイラも使います。ルールごとに書き直すと、少しずつ違う同じ判断がいくつもできます。
	</p>
	<p>
		Rust のコンパイラ rustc
		は、構文木の上に層を重ねます。コンパイル用に整理した構文木、型、処理しやすい中間表現です。各層は前の層を読んで事実を足し、コード検査や解析ツールは自分の問いに答える層を読みます。rsvelte
		も同じ形を取ります。
	</p>
	<p>
		カーネル（言語に依存しない共通部分）から見ると、層は計算結果の一つです。計算結果は、文書ごとに一度だけ計算して保存する値です（<a
			href="/learn/kernel/database">4 章</a
		>）。そのため層を入れるとき、カーネルに足すのは、層ごとに振る番号と、番号で引く表だけです。
	</p>

	<H2 id="ids" />
	<p>
		層は、自分の扱うものに 0
		から番号を振ります。あとの層がその番号について知った事実は、木に書き込まず、番号で引く表（解析結果の表）に置きます。木は一度作ったら変わりません。
	</p>
	<p>
		番号には型を付けます。番号の型は <code>newtype_index!</code> で作り、どれもトレイト
		<code>TypedIndex</code>（型付きの番号の共通の操作）を実装します。中身は、番号に 1 を足した
		<code>NonZeroU32</code> です（理由は次の節）。
	</p>
</div>

<Code item={data.code.index} />
<Code item={data.code.newtype} />

<div class="prose-learn">
	<p>
		<code>IndexVector&lt;I, T&gt;</code> は、<code>I</code> でしか引けない <code>Vec</code> です。束縛の表をスコープの番号で引こうとすると、コンパイルが通りません。
	</p>
</div>

<Code item={data.code.indexVec} />
<Code item={data.code.fromElem} />

<div class="prose-learn">
	<p>
		この型を最初に使ったのは、<code>rsvelte_typescript</code> のスコープ解析です。<code
			>BindingIdentifier</code
		>
		と <code>ScopeIdentifier</code>
		は型付きの番号になりました。ルートのスコープの親も、番兵（「値なし」を表す特別な値）の
		<code>u32::MAX</code>
		から <code>None</code> に変わりました。
	</p>
	<p>
		例外は、ノードごとの束縛の表です。今も生の <code>u32</code> に番兵 <code>u32::MAX</code>
		を入れて持ち、外には <code>binding_of</code> だけを見せます。この形を選んだ当時は、<code
			>Option&lt;BindingIdentifier&gt;</code
		> が 8 バイトでした。次の節の変更で 4 バイトになったので、今は大きさの差はありません。
	</p>

	<DeepDive title="層どうしの対応も表で持つ">
		<p>
			層を一つ下げると、「この要素は上の層のどれから来たか」という対応が要ります。これも表です。Svelte
			のコンパイル用に整理した構文木は、各要素を作った元の構文木の要素を表に記録します。その表は <code
				>origin: IndexVector&lt;CompilerNodeIdentifier, TemplateNodeIdentifier&gt;</code
			>
			です。下の図 5.1 の <code>← n</code> がこの対応です。
		</p>
	</DeepDive>

	<H2 id="niche" />
	<p>
		番号の型の中身を <code>NonZeroU32</code> にすると、Rust は 0
		が使われないことを知っています。そのため <code>Option&lt;Identifier&gt;</code> の
		<code>None</code>
		を 0 で表せます（空き値最適化）。<code>Option&lt;Identifier&gt;</code> は
		<code>Identifier</code> と同じ 4 バイトで、親や参照先がないことを特別な番号なしで表せます。
	</p>
	<p>
		代わりに、番号を作るたびに 1 を足し、表を引くたびに 1 を引きます。この形にした変更（コミット <code
			>36c3539efb</code
		>）は、その費用を 1 ラウンドあたりの命令数で +0.08% と測りました。1
		ラウンドは、全ファイルを一度通す計測です（<a href="/learn/measure#counters">14 章</a
		>）。得たものは、<code>svelte.resolve</code> の確保バイト数の 3.3% 減です。
	</p>
	<p>
		同じ変更で、よく使う記録の大きさをコンパイル時に固定しました。それぞれの型の隣に <code
			>const _: () = assert!(size_of::&lt;T&gt;() == N)</code
		> を置きます。欄を一つ足して型が広がると、性能の基準値と比べる検査（14 章）より先に、ビルドが止まります。
	</p>
</div>

<figure class="my-8 overflow-x-auto">
	<table class="table">
		<thead><tr><th>型</th><th class="num">バイト</th><th>ファイル</th></tr></thead>
		<tbody>
			{#each data.layouts as l (l.file + l.type)}
				<tr>
					<td><code>{l.type}</code></td>
					<td class="num">{l.bytes}</td>
					<td class="font-mono text-[13px] text-fg-2">{l.file}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		この教材が引用する crate の <code>assert!(size_of::&lt;T&gt;() == N)</code> を、ビルドのたびにソースから読んで並べた表です。
	</figcaption>
</figure>

<div class="prose-learn">
	<p>
		同じ変更では、整形用のデータ構造の <code>Node</code> を 16 バイトにする案も測りました。<code
			>&'static str</code
		>
		を持つ種類 <code>Static</code> をやめ、リテラルもテキストのバッファに写す案です。命令数もバイト数も増えたので、採用していません。
	</p>

	<H2 id="tokens" />
	<p>
		一番下の層は、書かれたものをすべて残します。普通の構文木にするか、空白やコメントも持つ構文木にするかは、言語ごとに決めます。カーネルが求めるのは、次の性質だけです。構文解析の結果が持つトークンを、空白とコメントも含めて順に並べると、ソースとバイト単位で一致することです。この性質は、言語を知らなくても確かめられます。
	</p>
</div>

<Code item={data.code.lossless} />

<div class="prose-learn">
	<p>
		トークン表は文書ごとに作っては捨てます。そのため、表のバッファはスレッドのプールから借りて返します（<a
			href="/learn/kernel/buffer-pool#users">13 章</a
		>）。
	</p>
</div>

<Code item={data.code.tokensDefault} />

<div class="prose-learn">
	<p>
		式が括弧で囲まれているか、文の前にどのコメントがあるか。書かれてはいても意味を持たないことへの問いには、ソースのバイトを読まずにトークン表で答えます。typescript-eslint
		の <code>getTokenBefore</code> にあたるのが <code>before</code> です。
	</p>
</div>

<Code item={data.code.before} />

<div class="prose-learn">
	<p>
		Svelte のトークンは、マークアップのトークン、JavaScript
		のパーサが消費したトークンとコメント、その間の空白です。スタイルシートは、今のところ一つの <code
			>Stylesheet</code
		> トークンです。スタイルシートのパーサが自分のトークンを記録するまでの扱いです。
	</p>
</div>

<Code item={data.code.tk} />

<div class="prose-learn">
	<p>
		トークン表と同時に、ツールがソースを読んで推測していた二つの事実を、元の構文木に記録しました。属性が省略形
		<code>{'{a}'}</code> で書かれたかと、タグが <code>/&gt;</code>
		で閉じたかです。コンパイル用に整理した構文木、型検査用のコード、整形の三か所から、<code
			>source_text.as_bytes()[…]</code
		> がなくなりました。
	</p>
	<p>
		トークン表がソースと一致することは、テストで確かめています。対象は、検証用のソースファイル集（公式ツールの出力と比べる、実在する
		Svelte ファイルの集まり）のうち、パーサが受け付ける 5,410 ファイルです。トークンは 882,917
		個、4,259,323 バイトです。
	</p>
	<p>
		このテストが壊れた記録を見つけられることも確かめました。属性のテキストを記録しない版をわざと作ると、3,602
		ファイルで落ちます。JavaScript のコメントを空白として記録する版では、303 ファイルで落ちます。
	</p>
	<p>
		記録を足しても、検証用のソースファイル集全体で出力は一つも変わっていません。費用は、全ファイルを
		1 スレッドで処理する時間の中央値で 451 ms から 459 ms（約 1.7%）です。最初は 3.5% で、ほとんどは
		JavaScript のトークン表が文書ごとに空から伸びる分でした。
	</p>

	<H2 id="stack" />
	<p>
		層の型や分け方は、言語プラグインが決めます。カーネルは、登録された計算結果を求められたときに計算して保存します。次の表と図は
		Svelte プラグインの例です。Rust の型は、表の上から <code>Parsed</code>、<code>Normalized</code
		>、<code>Resolved</code>、<code>Analyzed</code> です。出力の二つは <code>ScopedStylesheet</code>
		と <code>TypeScriptView</code> です。
	</p>
</div>

<figure class="my-8 overflow-x-auto">
	<table class="table">
		<thead><tr><th>計算結果</th><th>層</th><th>中身</th><th>読むタスク</th></tr></thead>
		<tbody>
			{#each stack as s (s.name)}
				<tr>
					<td class="whitespace-nowrap"><code>{s.name}</code></td>
					<td class="whitespace-nowrap">{s.layer}</td>
					<td class="text-[14.5px] text-fg-2">{s.what}</td>
					<td class="font-mono text-[13px] whitespace-nowrap text-fg-2">{s.readers}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</figure>

<div class="prose-learn">
	<p>
		「共通の呼び出し窓口」は、どの言語のプラグインからも求められる計算結果です（<a
			href="/learn/kernel/database">4 章</a
		>）。タスクは、文書に対して走る一つの処理です（<a href="/learn/kernel/pipeline">6 章</a
		>）。新しいツールはタスクを一つ書き、必要な層を <code>context.get</code> で求めます。同じ文書で別のタスクがすでに求めた層は、計算し直しません。
	</p>
</div>

<LayerView />

<div class="prose-learn">
	<H2 id="resolve" />
	<p>
		名前解決は、識別子の参照を宣言に結び付けます。どこで変数を参照できるかは、言語の規則で決まります。Svelte
		の例では、スクリプトとテンプレートの識別子を束縛に結び付け、<code>$state</code> などの rune の種類も記録します。
	</p>
</div>

<Code item={data.code.resolution} />
<Code item={data.code.bindKind} />

<div class="prose-learn">
	<p>
		以前、この情報はコンパイラの解析結果（<code>Analysis</code
		>）の一部でした。そのためコード検査はスコープを知りたいだけでも、スタイルシートのセレクタの照合を含む解析をまるごと計算していました。今は名前解決の結果
		<code>Resolved</code>
		を求めるだけです。<code>Analysis</code> は、名前解決の上にコンパイラだけが要る事実を足す層になりました。
	</p>
</div>

<Code item={data.code.resolve} />

<div class="prose-learn">
	<H2 id="compiler_syntax_tree" />
	<p>
		コンパイル用に整理した構文木は、元の構文木を、出力を作りやすい形に変換したものです。以下は
		Svelte
		のテンプレートの例で、この木の型や変換規則はカーネルの共通仕様ではありません。この木は元の構文木から作ります。ソースのテキストを読むのは、名前と、文字参照を展開するテキストだけです。コンパイラの解析（<code
			>svelte.analyze</code
		>）とクライアント・サーバーの出力は、元の構文木でなくこの木を読みます。
	</p>
	<ul>
		<li>
			<code>{'{#if}…{:else if}…{:else}'}</code> は、入れ子の <code>If</code> でなく、枝を並べた一つの要素になります。
		</li>
		<li>
			要素は種類を持ちます。通常の要素、コンポーネント、<code>{'<svelte:head>'}</code> の中の
			<code>{'<title>'}</code>、<code>{'<slot>'}</code>、<code>svelte:</code> のメタタグです。
		</li>
		<li>
			普通の属性の値は、論理属性、静的な文字列（文字参照は展開済み）、式一つ、省略形、補間のどれかです。<code
				>bind:</code
			> などの指示子とスプレッド構文には、それぞれ別の種類があります。
		</li>
		<li>テキストの文字参照は展開します。</li>
		<li>すべての要素が、<code>CompilerNodeIdentifier</code>、親、元の構文木での出所を持ちます。</li>
	</ul>
</div>

<Code item={data.code.compiler_syntax_tree} />
<Code item={data.code.attributeValue} />

<div class="prose-learn">
	<p>
		要素の種類は、公式の Svelte コンパイラのパーサ（<code>phases/1-parse/state/element.js</code
		>）と同じ順で決めます。<code>meta_tags</code>、<code>regex_valid_component_name</code>、<code
			>{'<svelte:head>'}</code
		>
		の中の <code>{'<title>'}</code>、<code>{'<slot>'}</code> の順です。
	</p>
	<p>
		<code>{'<title>'}</code> が <code>{'<svelte:head>'}</code>
		の中かは、親をさかのぼって調べます。<code>{'<svelte:head>'}</code>
		に着けば中、通常の要素かコンポーネントに着けば外です。ブロックとそれ以外の要素は飛ばします。この規則も、公式の
		<code>parent_is_head</code> と同じです。
	</p>
</div>

<Code item={data.code.elementKind} />

<div class="prose-learn">
	<p>
		<code>element_kind</code> は <code>CompilerSyntaxTreeBuilder</code>
		のメソッドです。この公開された型は Svelte の元の構文木を知りません。要素を足し、子の並びを記録し、祖先をたどって要素の種類を決めるだけです。Svelte
		の元の構文木からこの木を作るのは、<code>rsvelte_svelte</code> の中でこの型を使う
		<code>SurfaceBuilder</code> です。
	</p>
</div>

<Code item={data.code.compilerSyntaxTreeBuilder} />

<div class="prose-learn">
	<p>
		コンポーネント名の正規表現は、<code>\p{'{'}Lu}</code>、<code>\p{'{'}ID_Start}</code>、<code
			>\p{'{'}ID_Continue}</code
		>
		を使います。ID_Start と ID_Continue は <code>unicode-id-start</code> の表で判定します。<code
			>\p{'{'}Lu}</code
		>
		は、Rust の <code>char::is_uppercase</code> から Other_Uppercase（<code>Ⅰ</code> や
		<code>Ⓐ</code>）を除いたものです。<code>is_uppercase</code>
		はそれらも大文字に数えるからです<Note>
			Unicode の版の違いまでは揃えていません。V8 と Rust
			の標準ライブラリで表の版が違うと、新しく追加された文字の判定は分かれる場合があります。</Note
		>。
	</p>
	<p>
		子の番号の並びは、子をすべて作り終えてから、まとめて子の表に追加します。子を作るたびに孫の番号が先に積まれるので、先に追加すると兄弟の番号が連続しなくなります。
	</p>
</div>

<Code item={data.code.list} />

<div class="prose-learn">
	<H2 id="svue" />
	<p>
		コンパイル用に整理した構文木は外から作れて、属性名も、元のソースの位置だけでなく文字列として持てます。たとえば
		Vue の <code>@click</code> は <code>onclick</code> という名前になりますが、元のソースにその名前はありません。そのため別の言語からこの木を作れれば、同じコンパイラで
		Svelte のランタイム向けの JavaScript を出力できます。
	</p>
	<p>
		Svelte
		プラグインの解析と出力が読む木を、元の構文木からこの木へ替えたとき、出力のハッシュは前後で一致しました。対象は、Svelte
		の検証用のソースファイル集の compile・format・lint の出力 70,608 ファイルです。
	</p>
	<p>
		svue（crate <code>rsvelte_svue</code>）は、この仕組みで <code>.vue</code>
		のコンポーネントをコンパイルします。<strong>Vue の意味のまま</strong>、Svelte
		のランタイムで動く形にします。新しい言語は足さず、<code>.vue</code> の文書に
		<code>svue.compile/client</code>
		と <code>svue.compile/server</code> の二つのタスクを足すだけです。
	</p>
	<p>
		翻訳は、Vue プラグインの構文解析と名前解決の結果を読みます。Vue の構文木から、Svelte の runes
		を使うスクリプトと、コンパイル用に整理した構文木を作ります。その結果には、Svelte
		プラグインの名前解決、解析、出力を使います。
	</p>
</div>

<Code item={data.code.svueRegister} />
<Code item={data.code.svueTranslated} />
<Code item={data.code.svueInput} />

<div class="prose-learn">
	<p>
		書き方が同じでも、二つのランタイムでは意味が違います。Vue の <code>{'{{ e }}'}</code> は
		<code>toDisplayString</code>
		を通るので、オブジェクトは <code>JSON.stringify</code> と同じ形の文字列になります。Svelte の
		<code>{'{e}'}</code>
		は <code>String(e)</code> です。Vue では、渡されなかった <code>Boolean</code> の prop は
		<code>false</code> になり、宣言していない属性はルート要素に引き継がれます。
	</p>
	<p>
		翻訳はこうした違いを、Vue と同じ規則で再現します。表示と繰り返しは Vue
		の関数をそのまま呼び、残りは Vue の規則を写したコードを出力します。
	</p>
	<ul>
		<li>補間：<code>vue</code> の <code>toDisplayString</code> を呼びます。</li>
		<li><code>v-for</code>：<code>renderList</code> を呼びます。</li>
		<li>
			<code>Boolean</code> の prop：runtime-core の <code>resolvePropValue</code> を写した
			<code>$derived.by</code> にします。
		</li>
		<li>
			サーバー向けの <code>v-model</code>：compiler-ssr の <code>ssrTransformModel</code> が出力するのと同じ属性にします。
		</li>
	</ul>
	<p>
		svue と比べられる公式のコンパイラはないので、出力の文字列でなく動作を比べます。公式の Vue
		でビルドしたコンポーネントで、操作の手順ごとに画面の要素の木とサーバー描画の結果を記録します。それを、rsvelte
		の出力を Svelte のランタイムで動かした記録と比べます。
	</p>
	<p>
		svue のために足したのは、<code>compiler_syntax_tree::spelled_text</code>
		だけです。足した先は、公式の Svelte コンパイラを Rust に移植した部分（以下、Svelte の移植）です。これは、別の言語から渡された文字列を、テキストとして構文木に置きます。足す前後で、<code
			>svelte.compile</code
		> の出力はバイト単位で一致しました。Svelte の移植はどれも公式のコンパイラと出力を突き合わせるので、svue
		のために振る舞いは変えません。
	</p>
	<p>
		翻訳が出力するのは、Svelte の移植が公式と同じにコンパイルできる構文だけです。Vue
		のテキストは空白をすでに畳んでいます。そのため Svelte のコンパイラは、公式の <code
			>preserveWhitespace</code
		> オプションを付けて走らせ、空白を二度畳まないようにします。
	</p>
	<p>
		ルートに引き継ぐ属性は <code>{'{...attrs}'}</code> にし、<code>class</code> は runtime-core の
		<code>mergeProps</code>
		と同じ規則で合成します。Vue は、props に <code>class</code>
		のキーがあるときだけ属性を書きます。そのため、自分の <code>class</code>
		を持たない要素では、スプレッド構文の中で合成します。動作の比較は、見えない空白と空の
		<code>class</code>
		属性を区別できません。そこで空白の扱いと空の <code>class</code> は、crate のテストで固定しています。
	</p>
</div>

<Code item={data.code.svueClass} />

<div class="prose-learn">
	<p>
		svue を入れた変更（コミット <code>73c8eea9c1</code>）では、手書きの 12
		検証例のうち、クライアント用で 4、サーバー用で 7 が一致しました。残りは拒否で、不一致は 0
		でした。拒否したのは、翻訳はあっても、Svelte の移植がまだコンパイルできない構文です。
	</p>
	<p>
		拒否した構文は、クライアント用の <code>v-model</code>、ルートへの属性の引き継ぎ（<code
			>{'{...attrs}'}</code
		>）、<code>&lt;select&gt;</code> です。クライアント用の <code>v-model</code> は、<code
			>{'{@attach}'}</code
		>
		で Vue の <code>vModelText</code> などを走らせます。Svelte の移植が対応してからは、クライアント用とサーバー用の両方で
		12 検証例すべてが一致します。
	</p>
	<p>
		公式の Vue コンパイラを Rust に移植した部分（Vue の移植）には、<code>v-on</code>
		の修飾子を足しました。<code>vue.compile</code> も compiler-dom と同じく、<code
			>withModifiers</code
		>
		と <code>withKeys</code> を使って出力します。
	</p>

	<H2 id="vuelte" />
	<p>
		vuelte（crate <code>rsvelte_svelte_compile_vapor</code>）は、svue の逆向きです。Svelte
		のコンポーネントを Vue Vapor
		向けにコンパイルします。構文解析、名前解決、コンパイル用に整理した構文木への変換、解析は、<code
			>svelte.compile</code
		> と共有します。
	</p>
	<p>
		翻訳は JavaScript の木と Vue のテンプレートの木を新しく作ります。Rust で書いた Vapor
		の出力部が、その木から DOM を作る関数、描画の
		effect、分岐、繰り返しを出力します。タスクの識別子は <code>vuelte.compile/client</code> と
		<code>vuelte.compile/server</code> です。サーバー向けは、Vue のサーバー描画で使う HTML と head の内容を出力します。ハイドレーションには対応していません。
	</p>
</div>

<Code item={data.code.vuelteRegister} />
<Code item={data.code.vuelteModule} />

<div class="prose-learn">
	<p>
		vuelte も、svue と同じ方法で動作を比べます。比較元は、公式の Svelte
		でビルドしたコンポーネントの記録です。rsvelte の出力は Vue のランタイムで動かします。
	</p>
	<p>
		Svelte の要素への束縛は、Vapor の <code>renderEffect</code>
		の中で動きます。分岐、繰り返しの一つの要素、コンポーネントが取り除かれると、<code
			>onScopeDispose</code
		> が要素への束縛を片付けます。
	</p>
</div>

<Code item={data.code.vuelteRef} />
<Code item={data.code.vuelteBindText} />

<div class="prose-learn">
	<p>動作の比較で見つかった違いは、それぞれ次のように再現しています。</p>
	<ul>
		<li>
			補間：値を Svelte と同じ規則で文字列にしてから、Vue の <code>toDisplayString</code>
			へ渡します。クライアント用は <code>{"`${e ?? ''}`"}</code>、サーバー用は
			<code>{"String(e ?? '')"}</code> です。
		</li>
		<li>
			要素の間の空白：Svelte の <code>clean_nodes</code> が残したテキストを、そのまま Vue の構文木に入れます。Vue
			の空白の畳み込みは、構文木を作った後には走りません。
		</li>
		<li>
			渡されなかった prop：<code>defineProps</code> に <code>type</code> を書かないので、Vue の
			<code>Boolean</code> への変換が起きません。
		</li>
		<li>
			宣言していない属性：すべてのコンポーネントに <code
				>defineOptions({'{ inheritAttrs: false }'})</code
			>
			を付けます。<code>{'let { ...rest } = $props()'}</code> は <code>useAttrs()</code>
			にします。スプレッド構文を持つ要素では、すべての属性を一つのオブジェクトにまとめます。それを、Svelte
			の <code>set_attributes</code>（クライアント用）と
			<code>attributes</code>（サーバー用）を移植した補助関数に渡します。
		</li>
		<li>数値と範囲の入力欄の <code>bind:value</code>：文字列でなく数値として読み書きします。</li>
	</ul>
	<p>
		再現できない構文は、それらしく変換せず、出力を作る前に拒否します。たとえばアタッチメント、action、トランジション、アニメーションの式の中の
		<code>await</code> です。対応の範囲は
		<code>crates/languages/svelte/compile_vapor/COVERAGE.md</code> にまとめています。
	</p>
	<p>
		vuelte を入れた変更（コミット <code>24c6e6a123</code>）では、手書きの 12 検証例のうち 11
		で、クライアント用とサーバー用の両方が一致しました。残りの一つはスプレッド構文の属性で、拒否していました。スプレッド構文に対応した後は、12
		検証例すべてが一致します。
	</p>
	<p>
		Svelte の検証用のソースファイル集では、クライアント用を 685 件、サーバー用を 686
		件出力し、異常終了は 0 件です。どの出力も、公式の Svelte
		と並べて動かすと、表示した時点の記録が一致しました。両方が同じ例外を投げるものも含みます。
	</p>
	<p>
		Vue の移植の側に足したのは、<code>defineOptions</code>、<code>&lt;pre&gt;</code>、関数の
		<code>:ref</code>、オブジェクトの <code>v-bind</code> の四つです。足す前後で、Vue の検証例のコンパイル出力は変わっていません。
	</p>

	<H2 id="lint" />
	<p>
		コード検査のルールは、読む層を文書の <code>DocumentContext</code
		>（文書ごとの計算結果の入れ物）から求めます。読む層はルールごとに違います。
	</p>
	<ul>
		<li>
			<code>no-unused-vars</code> は、元の構文木と名前解決を読みます。ESLint のルールの移植で、親の要素の種類や宣言の書き方を見て判断するので、書かれたとおりの木が要ります。
		</li>
		<li>
			<code>svelte/button-has-type</code> は、元の構文木だけを読みます。名前解決は要りません。属性の値の部品がすべて文字列なら静的な値として判定し、式を含む値は判定しません。判定そのものは、次の節の共通の関数に任せます。
		</li>
		<li>
			<code>svelte/valid-each-key</code> は、コンパイル用に整理した構文木の <code>{'{#each}'}</code> と名前解決を読みます。
		</li>
	</ul>
	<p>
		Svelte プラグインでは、設定の中の各ルール（<code>RuleConfiguration</code>）が <code>Rule</code>
		を実装し、必要な層をその場で求めます。<code>rsvelte_lint_runner</code> の <code>Findings</code> は、ルールを設定の順に走らせ、指摘を一つの並びにまとめます。並びは開始位置の順で、同じ位置の指摘はルールの順に残ります。
	</p>
</div>

<Code item={data.code.findings} />
<Code item={data.code.lint} />
<Code
	item={data.code.ruleImpl}
	mark={[
		'.get::<Parsed>()',
		'no_unused_variables::check(context, reporter)',
		'valid_each_key::check(context, reporter)',
	]}
/>
<Code
	item={data.code.button}
	mark={[
		'static_problem(component, source, attribute, allowed)',
		'AttributeValue::True',
		'None if !shorthand && !spread',
	]}
/>
<Code
	item={data.code.staticProblem}
	mark={['let Part::Text(span) = part else', 'check_static(&value, allowed)']}
/>

<div class="prose-learn">
	<H2 id="shared-lint" />
	<p>
		Svelte と Vue の公式のコード検査のプラグインには、ボタンの種類を調べるルールが別々にあります。<code
			>svelte/button-has-type</code
		>
		と <code>vue/html-button-has-type</code> です。rsvelte では判断の部分を、<code
			>rsvelte_markup::button_type</code
		>
		の一つの関数にしています。判断の部分とは、<code>type</code> が取れる値、四つのメッセージ、オプションです。
	</p>
</div>

<Code item={data.code.buttonType} />

<div class="prose-learn">
	<p>
		どちらのルールも、それぞれの言語の元の構文木の上で書かれています。各プラグインに残るのは、二つの木の違いから来る部分だけです。
	</p>
	<ul>
		<li>
			Svelte は、値の種類を問わず最初の <code>type</code> を取ります。省略形 <code>{'{type}'}</code> でも条件を満たし、指摘は属性全体に付きます。
		</li>
		<li>
			Vue は、静的な <code>type</code> を先に探してから <code>:type</code> を見ます。属性名は大文字小文字を区別せずに比べ、指摘は値の要素（引用符を含む）に付きます。
		</li>
	</ul>
</div>

<Code
	item={data.code.vueButton}
	mark={['check_static(&text, Allowed::default())', 'value_node(v, a.quoted)']}
/>

<div class="prose-learn">
	<p>
		<code>vue/html-button-has-type</code> は、このとき新しく足したルールです。<code>vue.lint</code>
		は 19 検証例中 19 で、公式ツールと一致しました。報告の範囲を引用符の分だけわざとずらすと 18/19 に落ちるので、比較がこの差を見分けられることも確かめています。<code
			>svelte.lint</code
		> は 12/12 のままでした。
	</p>

	<H2 id="next" />
	<Caution>この節は計画です。型の項の前半だけは、今ある試作の説明です。</Caution>
	<ul>
		<li>
			型：型を使うコード検査の試作（<code>rsvelte_svelte_lint_typed</code
			>）があります。今は構文と名前解決から型を推論し（<code>TypeFacts::infer</code
			>）、ルールはそれを共通の呼び出し窓口から受け取ります。計画は、型を tsgo（Go で書かれた
			TypeScript コンパイラ）から引くことです。引いた型は、<code>CompilerNodeIdentifier</code>
			と式の <code>NodeIdentifier</code> で引く表にします。型を持つ層は、コンパイル用に整理した構文木とは別の計算結果にします。
		</li>
		<li>
			制御フローとデータフロー：コンパイル用に整理した構文木とは別の構造にします。基本ブロックと辺の表、それに
			<code>$state</code> と <code>$derived</code> の依存のグラフです。要素は、コンパイル用に整理した構文木の番号を指します。
		</li>
		<li>
			出力：型検査用の TypeScript コード（<code>ts.view</code> の Svelte の文書の分）は、今は元の構文木から作っています。これをコンパイル用に整理した構文木とデータフローの層から作れば、コンパイラやコード検査と同じ層を読むことになります。
		</li>
	</ul>
</div>

<ChapterFooter chapter={c} />
