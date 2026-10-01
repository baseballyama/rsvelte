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
	import LayerView from '$lib/widgets/LayerView.svelte';

	let { data } = $props();
	const c = chapter('layers');

	const stack = [
		{ name: 'svelte.parse', layer: '表層', what: '書かれたとおりの木。整形はこれだけを読む。', readers: 'すべて' },
		{ name: 'svelte.resolve', layer: '名前解決', what: 'スコープ、名前から束縛への対応、rune の種類。', readers: 'compile, lint' },
		{ name: 'svelte.compiler_syntax_tree', layer: 'HIR', what: 'コンパイラが理解する形のテンプレート。', readers: 'compile, lint' },
		{ name: 'svelte.analyze', layer: 'コンパイラの派生', what: '式の依存、動的な断片、スタイルシートが選ぶ要素。コンパイル用に整理した構文木と名前解決を読む。', readers: 'compile' },
		{ name: 'svelte.css', layer: '出力', what: 'スコープを付けた スタイルシート。', readers: 'compile' },
		{ name: 'ts.view', layer: '出力（共通の呼び出し窓口）', what: '型検査が読む TypeScript。Svelte の答えは元の構文木から作る。', readers: 'check' }
	];
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="パースした木は、書かれたとおりの形をしています。lint や型検査が知りたいのは、それが何を意味するかです。この章では、構文木の上に名前解決と コンパイル用に整理した構文木を一枚ずつ重ね、ルールやツールが必要な層だけを読む仕組みを見ます。"
/>

<div class="prose-learn">
	<H2 id="why" />
	<p>
		<code>svelte/button-has-type</code> は、<code>{'<button>'}</code> に <code>type</code>
		があるかを調べるルールです。これを構文木の上で書くと、属性の値がテキストの断片と式の断片の列として出てきます。静的な文字列かどうか、文字参照を展開した値は何か、<code
			>{'{type}'}</code
		>
		という省略形か。これを判断するコードは、コンパイラの中にもすでにあります。ルールごとに書き直すと、同じ判断が少しずつ違う形でいくつもできてしまいます。
	</p>
	<p>
		Rust のコンパイラ rustc は、構文木から コンパイル用に整理した構文木、型、さらに処理しやすく変換した中間表現 へと層を重ねます。各層は前の層を読んで事実を足し、lint
		や解析ツールは自分の問いに答える層を読みます。rsvelte も同じ形を取ります。層はカーネルにとってはただの計算結果なので、仕組みとして新しく必要なのは二つだけです。層ごとに振る番号と、番号で引く表です。
	</p>

	<H2 id="ids" />
	<p>
		層は、自分の扱うものに 0 から番号を振ります。その番号についてあとの層が知った事実は、木に書き込まず、番号で引く表（解析結果の表）に置きます。木は一度作ったら変わりません。
	</p>
	<p>
		番号には型を付けます。<Term name="TypedIndex" /> は番号の型が満たすトレイトで、<code>newtype_index!</code> が番号の型を作ります。中身は
		<code>u32</code> ではなく、番号に 1 を足した <code>NonZeroU32</code> です（理由は次の節）。
	</p>
</div>

<Code item={data.code.index} />
<Code item={data.code.newtype} />

<div class="prose-learn">
	<p>
		<code>IndexVector&lt;I, T&gt;</code> は、<code>I</code> でしか引けない <code>Vec</code> です。束縛の表をスコープの番号で引こうとすると、実行時に間違った値を返すのではなく、コンパイルが通りません。
	</p>
</div>

<Code item={data.code.indexVec} />
<Code item={data.code.fromElem} />

<div class="prose-learn">
	<p>
		<code>rsvelte_javascript</code> のスコープ解析は、この型を最初に使った場所です。<code>BindingIdentifier</code> と <code>ScopeIdentifier</code>
		は型付きの番号になり、ルートのスコープの親は番兵の <code>u32::MAX</code> ではなく <code>None</code> になりました。例外は、要素ごとの束縛を引く表です。これは今も生の
		<code>u32</code> に番兵 <code>u32::MAX</code> を入れる形で持ち、外には <code>binding_of</code> だけを見せています。この形を選んだ当時は
		<code>Option&lt;BindingIdentifier&gt;</code> が 8 バイトだったためで、次の節の変更のあとは <code>Option&lt;BindingIdentifier&gt;</code> も 4 バイトです。
	</p>

	<DeepDive title="層どうしの対応も表で持つ">
		<p>
			層を一つ下げると、「この要素は上の層のどれから来たか」という対応が必要になります。これも表です。コンパイル用に整理した構文木は <code
				>origin: IndexVector&lt;CompilerNodeIdentifier, TemplateNodeIdentifier&gt;</code
			>
			という対応表を持ちます。この表で各要素が元の構文木のどの要素から作られたかを記録します。図 5.1 の <code>← n</code> がその対応です。
		</p>
	</DeepDive>

	<H2 id="niche" />
	<p>
		番号の型の中身を <code>NonZeroU32</code> にすると、Rust は 0 という値が使われないことを知っているので、<code>Option&lt;Identifier&gt;</code>
		の <code>None</code> を 0 で表せます（空き値最適化）。<code>Option&lt;Identifier&gt;</code> は <code>Identifier</code> と同じ 4 バイトです。親や参照先の有無を、特別な識別番号を決めずに表せます。rustc
		と oxc の番号の型も同じ形です。
	</p>
	<p>
		代わりに、番号を作るたびに 1 を足し、表を引くたびに 1 を引きます。導入したコミットは、その費用を 1 ラウンドの命令数で +0.08% と測っています。得たものは、<code
			>svelte.resolve</code
		>
		の確保バイト数の 3.3% 減です（36c3539efb）。<code>newtype_index!</code> は、<code>const ROOT = 0;</code>
		のように名前の付いた番号も受け取ります。
	</p>
	<p>
		同じコミットで、よく使う記録の大きさをコンパイル時に固定しました。<code>const _: () = assert!(size_of::&lt;T&gt;() == N)</code>
		をそれぞれの型の隣に置き、欄を一つ足して型が広がると、性能の基準値との比較検査で気づく前にビルドが止まります。大きさを変えることは、偶然ではなく判断になります。
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
		この教材が引用する crate の中の <code>assert!(size_of::&lt;T&gt;() == N)</code> を、ビルドのたびにソースから読んで並べた表です。
	</figcaption>
</figure>

<div class="prose-learn">
	<p>
		整形用のデータ構造 の <code>Node</code> を 16 バイトにする案（<code>&'static str</code> の <code>Static</code> をやめ、リテラルもテキストのバッファに写す）も測られています。命令数もバイト数も増えたので、採用していません（36c3539efb）。
	</p>

	<H2 id="tokens" />
	<p>
		いちばん下の層は、書かれたものを何も落としてはいけません。構文木を構文木にするか 空白やコメントも保持した構文木にするかは言語ごとに決めてよく、カーネルはそこに口を出しません。カーネルが求めるのは一つだけで、構文解析の結果が持つトークンを、空白とコメントも含めて順に並べると、ソースとバイト単位で一致することです。この性質は言語を知らなくても確かめられます。
	</p>
</div>

<Code item={data.code.lossless} />

<div class="prose-learn">
	<p>
		トークン表は文書ごとに作っては捨てるので、そのバッファもスレッドのプールから借りて返します（<a href="/learn/kernel/buffer-pool#users">12</a>）。
	</p>
</div>

<Code item={data.code.tokensDefault} />

<div class="prose-learn">
	<p>
		「この式は括弧で囲まれているか」「この文の前にどのコメントがあるか」のように、書かれてはいるが意味を持たないことへの問いには、ソースのバイトを覗かずにトークン表で答えます。typescript-eslint
		の <code>getTokenBefore</code> にあたるのが <code>before</code> です。
	</p>
</div>

<Code item={data.code.before} />

<div class="prose-learn">
	<p>
		Svelte のトークンは、マークアップのトークンと、JavaScript のパーサが消費したトークンとコメント、その間の空白です。スタイルシートは、スタイルシート
		のパーサが自分のトークンを記録するまでは一つの <code>Stylesheet</code> トークンです。
	</p>
</div>

<Code item={data.code.tk} />

<div class="prose-learn">
	<p>
		トークン表を入れたのと同時に、道具がソースを覗いて推測していた二つの事実、属性が省略形 <code>{'{a}'}</code>
		で書かれたかとタグが <code>/&gt;</code> で閉じたかを、元の構文木に記録しました。コンパイル用に整理した構文木、型検査の型検査用のコード、整形の三か所にあった
		<code>source_text.as_bytes()[…]</code> がなくなっています。
	</p>
	<p>
		検証用のソースファイル集のうちパーサが受け付ける 5,410 ファイルで、トークン表がソースと一致することをテストで確かめています（トークン 882,917 個、4,259,323
		バイト）。属性のテキストを記録しない版と、JavaScript のコメントを空白として記録する版を作ると、このテストはそれぞれ
		3,602 ファイルと 303 ファイルで落ちます。出力は検証用のソースファイル集全体で一つも変わっていません。記録の費用は、1 スレッドで全検証用のソースファイル集を処理する時間の中央値で
		451 ms から 459 ms（約 1.7%）です。最初は 3.5% で、そのほとんどは JavaScript のトークン表が文書ごとに空から伸びることでした。
	</p>

	<H2 id="stack" />
	<p>Svelte プラグインの層と、それぞれを読むタスクです。</p>
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

<LayerView />

<div class="prose-learn">
	<H2 id="resolve" />
	<p>
		名前解決は、構文木のすぐ上の層です。スクリプトとテンプレートのすべての識別子を束縛に結び、束縛ごとに宣言した rune の種類を付けます。
	</p>
</div>

<Code item={data.code.resolution} />
<Code item={data.code.bindKind} />

<div class="prose-learn">
	<p>
		以前、この情報はコンパイラの解析結果（<code>Analysis</code>）の一部でした。そのため lint は、スコープを知りたいだけなのに、スタイルシート
		のセレクタの照合まで含むコンパイラの解析をまるごと計算していました。今は <code>Resolved</code> を求めるだけです。<code>Analysis</code>
		は、名前解決の上にコンパイラだけが必要とする事実を足す層になりました。
	</p>
</div>

<Code item={data.code.resolve} />

<div class="prose-learn">
	<H2 id="compiler_syntax_tree" />
	<p>
		コンパイル用に整理した構文木は、テンプレートをコンパイラが理解する形に直したものです。作るときに読むのは元の構文木で、ソースのテキストを読むのは名前と、文字参照を展開するテキストだけです。コンパイラの解析（<code
			>svelte.analyze</code
		>）とクライアント・サーバーの出力は、元の構文木ではなく コンパイル用に整理した構文木を読みます。
	</p>
	<ul>
		<li><code>{'{#if}…{:else if}…{:else}'}</code> は、入れ子の <code>If</code> ではなく、枝を並べた一つの要素になります。</li>
		<li>要素は種類を持ちます。通常の要素、コンポーネント、<code>{'<svelte:head>'}</code> の中の <code>{'<title>'}</code>、<code
				>{'<slot>'}</code
			>、<code>svelte:</code> のメタタグです。</li>
		<li>属性の値は、論理属性、静的な文字列（文字参照は展開済み）、式一つ、省略形、補間に分類されます。</li>
		<li>テキストは文字参照を展開します。</li>
		<li>すべての要素が <code>CompilerNodeIdentifier</code>、親、表層での出所を持ちます。</li>
	</ul>
</div>

<Code item={data.code.compiler_syntax_tree} />
<Code item={data.code.attributeValue} />

<div class="prose-learn">
	<p>
		要素の種類は、Svelte のパーサ（<code>phases/1-parse/state/element.javascript</code>）と同じ順で決めます。<code>meta_tags</code>、<code
			>regex_valid_component_name</code
		>、<code>{'<svelte:head>'}</code> の中の <code>{'<title>'}</code>、<code>{'<slot>'}</code> の順です。親をたどるとき、ブロックと通常の要素・コンポーネント以外の要素は素通りします。これも上流の
		<code>parent_is_head</code> と同じです。
	</p>
</div>

<Code item={data.code.elementKind} />

<div class="prose-learn">
	<p>
		<code>element_kind</code> は <code>CompilerSyntaxTreeBuilder</code> のメソッドです。<code>CompilerSyntaxTreeBuilder</code> は公開された型で、Svelte
		の元の構文木を知りません。要素を足し、子の並びを記録し、祖先をたどって要素の種類を決めるだけです。Svelte の元の構文木から コンパイル用に整理した構文木を作るのは、その上に書かれた
		<code>SurfaceBuilder</code> です。
	</p>
</div>

<Code item={data.code.compilerSyntaxTreeBuilder} />

<div class="prose-learn">
	<p>
		コンポーネント名の正規表現は <code>\p{'{'}Lu}</code>、<code>\p{'{'}ID_Start}</code>、<code>\p{'{'}ID_Continue}</code>
		を使います。ID_Start と ID_Continue は <code>unicode-id-start</code> の表で判定します。<code>\p{'{'}Lu}</code> は
		Rust の <code>char::is_uppercase</code> から Other_Uppercase（<code>Ⅰ</code> や <code>Ⓐ</code>）を除いたものです。<code
			>is_uppercase</code
		>
		はそれらも大文字に数えるからです<Note>
			Unicode の版の違いまでは揃えていません。V8 と Rust の標準ライブラリが別の版の表を持っていれば、新しく追加された文字で判定が分かれることがあります。</Note
		>。
	</p>
	<p>
		子の並びは、子を作り終えてから番号をまとめて追加します。子を作るたびに孫の番号が先に積まれるので、先に追加すると兄弟が連続しなくなります。
	</p>
</div>

<Code item={data.code.list} />

<div class="prose-learn">
	<H2 id="svue" />
	<p>
		コンパイラが コンパイル用に整理した構文木だけを読むので、コンパイル用に整理した構文木を作れる別の構文があれば、そのまま Svelte としてコンパイルできます。<code>rsvelte_svue</code>
		はその実験です。<code>.svue</code> は Vue のテンプレート構文で書き、Svelte の意味でコンパイルします。<code>{'{{ e }}'}</code> は <code
			>{'{e}'}</code
		>、<code>:x="e"</code> は <code>x={'{e}'}</code>、<code>@x="e"</code> は <code>onx={'{e}'}</code>、<code>v-if</code> /
		<code>v-else-if</code> / <code>v-else</code> の並びは一つの <code>{'{#if}'}</code> です。
	</p>
	<p>
		新しいコンパイラは書いていません。パースは Vue プラグインのパーサ（計算結果も Vue プラグインの <code>rsvelte_vue::Parsed</code>
		そのもの）、名前解決と解析と出力は Svelte プラグインのものです。<code>rsvelte_svue</code> が持っているのは、Vue の木から Svelte の コンパイル用に整理した構文木
		を作る変換だけです。
	</p>
</div>

<Code item={data.code.svueRegister} mark={['.artifact::<rsvelte_vue::Parsed>()']} />
<Code item={data.code.svueFrontend} />
<Code item={data.code.svueBuild} mark={['CompilerSyntaxTreeBuilder::new(source_text, sfc.nodes.len(), sfc.attributes.len())']} />

<div class="prose-learn">
	<p>
		名前解決も Svelte の関数を、Vue のパーサが作った JavaScript の木と、変換が集めたテンプレートの式に対して呼ぶだけです。コンパイラが受け取るのは、どちらのフロントエンドでも同じ形の入力です。
	</p>
</div>

<Code item={data.code.svueResolved} />
<Code item={data.code.compileInputType} />

<div class="prose-learn">
	<p>
		Svelte に変換できない構文は <code>compile_unsupported</code> で拒否します。
		対象は <code>v-for</code>、引数と値を持つ <code>:x</code> と <code>@x</code> 以外の指令、二つ目のスタイル要素です。
		比較用の変換処理は、Rust の実装とは別に <code>tools/fixtures/src/svue.ts</code> に書いています。
		この処理で Svelte の構文に書き直し、公式コンパイラに渡します。
		導入時は、5検証例のクライアント用・サーバー用の出力がすべて一致しました（96b8f37ac8）。
	</p>
	<p>
		Svelte プラグインにも二つの変更が必要でした。コンパイル用の構文木を外部から作れるようにしました。
		また、属性名を元のソース内の位置だけでなく、文字列としても保存できるようにしました。たとえば <code
			>@click</code
		>
		は <code>onclick</code> という名前になります。元のソースにはその名前は書かれていません。その前段として、解析と出力が元の構文木ではなく
		コンパイル用に整理した構文木を読むように移しています。移したときは、Svelte の検証用のソースファイル集で compile・format・lint の出力 70,608 ファイルのハッシュが前後で一致しました（db94f0bd13）。
	</p>

	<H2 id="lint" />
	<p>
		ルールは、自分の問いに答える層の上で書きます。rustc と同じく、構文木を読むルールを <dfn>early</dfn>、下げた層を読むルールを
		<dfn>late</dfn> と呼びます。
	</p>
	<ul>
		<li>
			<code>no-unused-variables</code> は early のままです。ESLint の移植で、親の要素の種類や宣言の書き方を見て判断するので、書かれたとおりの木が要ります。
		</li>
		<li>
			<code>svelte/button-has-type</code> は late です。知りたいのは属性の値が静的な文字列かどうかで、コンパイル用に整理した構文木ではそれがすでに分類されています。
		</li>
	</ul>
	<p>
		カーネルの <code>Findings</code> は、層ごとのルールの組を順に走らせて、一つの並びにまとめます。同じ位置の指摘は、先に走った層、同じ層の中ではルールの順になります。
	</p>
</div>

<Code item={data.code.findings} />
<Code item={data.code.lint} />
<Code item={data.code.button} mark={['AttributeValue::Boolean', 'AttributeValue::Static(v) => check_static(v, Allowed::default())', 'AttributeValue::Shorthand(_)']} />

<div class="prose-learn">
	<p>
		移したあとも出力は変わっていません。移す前（<code>dcf796e11a</code>）と移したあと（<code>1789210b8e</code>）のバイナリで全検証用のソースファイル集を走らせ、出力
		88,094 ファイルのハッシュを比べると、変わったものは 0 でした。lint の出力は 17,488 ファイルで、そのうち
		<code>button-has-type</code> の指摘は「type がない」が 580 件、「値が空」が 2 件、「値が不正」が 1 件あります。
	</p>
	<p>
		0 という結果は、変化を見分けられる測り方でなければ意味を持ちません。そこで「値が不正」の分岐だけを潰したバイナリを作って同じ比較をすると、変わったのは
		1 ファイルで、その指摘を持つ唯一のファイルと一致しました。
	</p>

	<H2 id="shared-lint" />
	<p>
		Svelte と Vue の公式プラグインには、ボタンの種類を調べるルールが別々に実装されています。
		それぞれ <code>svelte/button-has-type</code> と <code>vue/markup-button-has-type</code> です。rsvelte
		では判断の部分、つまり <code>type</code> が取れる値、四つのメッセージ、オプションを <code>rsvelte_markup::button_type</code> の一つの関数にしています。
	</p>
</div>

<Code item={data.code.buttonType} />

<div class="prose-learn">
	<p>
		各プラグインに残るのは、二つの木の違いから来る部分だけです。
	</p>
	<ul>
		<li>
			Svelte は値の種類を問わず最初の <code>type</code> を取り、省略形 <code>{'{type}'}</code> でも満たされ、指摘は属性全体に付きます。
		</li>
		<li>
			Vue は静的な <code>type</code> を先に探してから <code>:type</code> を見て、属性名を大文字小文字の区別なく比べ、指摘は値の要素（引用符を含む）に付きます。
		</li>
	</ul>
</div>

<Code item={data.code.vueButton} mark={['check_static(&text, Allowed::default())', 'value_node(v, a.quoted)']} />

<div class="prose-learn">
	<p>
		Vue のルールは late の層を持たないので、元の構文木の上で書かれています。Svelte のルールは コンパイル用に整理した構文木の上です。層が違っても、判断を共有するのに困ることはありません。共有しているのは層ではなく、値についての判断だからです。
	</p>
	<p>
		<code>vue/markup-button-has-type</code> はこのとき新しく足したルールで、<code>vue.lint</code> は 19 検証例中 19 で比較元の公式ツールと一致しました。報告の範囲を引用符の分だけずらすと
		18/19 に落ちることを対照として確かめています。<code>svelte.lint</code> は 12/12 のままでした（5c933023a7）。
	</p>

	<H2 id="next" />
	<Caution>ここから先は計画で、まだコードはありません。</Caution>
	<ul>
		<li>
			<strong>型</strong>: tsgo から引き、<code>CompilerNodeIdentifier</code> と式の <code>NodeIdentifier</code> で引く表にします。型を持つ層は、コンパイル用に整理した構文木
			とは別の計算結果です。
		</li>
		<li>
			<strong>制御フローとデータフロー</strong>: コンパイル用に整理した構文木とは別の構造にします。基本ブロックと辺の表、それに <code>$state</code> と
			<code>$derived</code> の依存のグラフです。要素は コンパイル用に整理した構文木の番号を指します。
		</li>
		<li>
			<strong>出力</strong>: クライアントとサーバーの JavaScript は、すでに コンパイル用に整理した構文木から作っています。型検査用に生成する TypeScript コード（<code>ts.view</code>
			の Svelte の答え）は、まだ元の構文木から作っています。これを コンパイル用に整理した構文木とデータフローの層から作るように移すと、コンパイラ、lint、型検査が同じ判断を共有します。
		</li>
		<li>
			<strong>独自のツール</strong>: 新しいツールはタスクを一つ書き、必要な層を <code>context.get</code> で求めるだけです。既存のタスクと同じ層を読むなら、その層は計算し直されません。
		</li>
	</ul>
</div>

<ChapterFooter chapter={c} />
