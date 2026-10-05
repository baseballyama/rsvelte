<script lang="ts">
	import type { PageData } from './$types';
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

	let { data }: { data: PageData } = $props();
	const c = chapter('layers', 'ja');

	const stack = [
		{ name: 'svelte.parse', layer: '表層', what: '書かれたとおりの木。整形はこれだけを読む。', readers: 'すべて' },
		{ name: 'svelte.compiler_syntax_tree', layer: 'HIR', what: 'コンパイラが理解する形のテンプレート。', readers: 'compile, lint' },
		{ name: 'svelte.resolve', layer: '名前解決', what: 'スコープ、名前から束縛への対応、rune の種類。コンパイル用に整理した構文木を読む。', readers: 'compile, lint' },
		{ name: 'svelte.analyze', layer: 'コンパイラの派生', what: '式の依存、動的な断片、スタイルシートが選ぶ要素。コンパイル用に整理した構文木と名前解決を読む。', readers: 'compile' },
		{ name: 'svelte.css', layer: '出力', what: 'スコープを付けた スタイルシート。', readers: 'compile' },
		{ name: 'ts.view', layer: '出力（共通の呼び出し窓口）', what: '型検査が読む TypeScript。Svelte の答えは元の構文木から作る。', readers: 'check' }
	];
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="パースした木は、書かれたとおりの形をしています。lint や型検査が知りたいのは、それが何を意味するかです。この章では、構文木の上にコンパイル用に整理した構文木を重ね、その上に名前解決を重ねて、ルールやツールが必要な層だけを読む仕組みを見ます。"
/>

<div class="prose-learn">
	<H2 id="why" />
	<p>
		構文だけを調べる検査と、値の意味も調べる検査では、必要な情報が違います。
		例として、Svelte の <code>svelte/button-has-type</code> は、<code>{'<button>'}</code> に <code>type</code>
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
		<code>rsvelte_typescript</code> のスコープ解析は、この型を最初に使った場所です。<code>BindingIdentifier</code> と <code>ScopeIdentifier</code>
		は型付きの番号になり、ルートのスコープの親は番兵の <code>u32::MAX</code> ではなく <code>None</code> になりました。例外は、要素ごとの束縛を引く表です。これは今も生の
		<code>u32</code> に番兵 <code>u32::MAX</code> を入れる形で持ち、外には <code>binding_of</code> だけを見せています。この形を選んだ当時は
		<code>Option&lt;BindingIdentifier&gt;</code> が 8 バイトだったためで、次の節の変更のあとは <code>Option&lt;BindingIdentifier&gt;</code> も 4 バイトです。
	</p>

	<DeepDive title="層どうしの対応も表で持つ">
		<p>
			層を一つ下げると、「この要素は上の層のどれから来たか」という対応が必要になります。これも表です。コンパイル用に整理した構文木は <code
				>origin: IndexVector&lt;CompilerNodeIdentifier, TemplateNodeIdentifier&gt;</code
			>
			という対応表を持ちます。これは Svelte のコンパイル用の木の例です。この表で各要素が元の構文木のどの要素から作られたかを記録します。図 5.1 の <code>← n</code> がその対応です。
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
	<p>層の型や分け方は言語プラグインが決めます。カーネルは、登録された計算結果を要求に応じて保存します。以下の表と図は Svelte プラグインの実装例です。</p>
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
		名前解決は、識別子の参照を宣言に結び付ける処理です。どこで変数を参照できるかは、言語の規則に従います。
		Svelte の実装例では、スクリプトとテンプレートの識別子を束縛に結び付けます。
		<code>$state</code> など、状態の扱いを指定する関数も rune の種類として記録します。
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
		コンパイル用の木は、元の構文木を出力先の処理に適した形へ変換したものです。
		以下は Svelte のテンプレートを変換する実装例です。この木の型や変換規則は、カーネルの共通仕様ではありません。作るときに読むのは元の構文木で、ソースのテキストを読むのは名前と、文字参照を展開するテキストだけです。コンパイラの解析（<code
			>svelte.analyze</code
		>）とクライアント・サーバーの出力は、元の構文木ではなく コンパイル用に整理した構文木を読みます。
	</p>
	<ul>
		<li><code>{'{#if}…{:else if}…{:else}'}</code> は、入れ子の <code>If</code> ではなく、枝を並べた一つの要素になります。</li>
		<li>要素は種類を持ちます。通常の要素、コンポーネント、<code>{'<svelte:head>'}</code> の中の <code>{'<title>'}</code>、<code
				>{'<slot>'}</code
			>、<code>svelte:</code> のメタタグです。</li>
		<li>普通の属性の値は、論理属性、静的な文字列（文字参照は展開済み）、式一つ、省略形、補間に分類されます。<code>bind:</code> などの指示子とスプレッド構文には、それぞれ別の種類があります。</li>
		<li>テキストは文字参照を展開します。</li>
		<li>すべての要素が <code>CompilerNodeIdentifier</code>、親、表層での出所を持ちます。</li>
	</ul>
</div>

<Code item={data.code.compiler_syntax_tree} />
<Code item={data.code.attributeValue} />

<div class="prose-learn">
	<p>
		要素の種類は、Svelte のパーサ（<code>phases/1-parse/state/element.js</code>）と同じ順で決めます。<code>meta_tags</code>、<code
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
		コンパイラは コンパイル用に整理した構文木だけを読みます。そのため、別の言語からこの構文木を作れれば、同じコンパイラで Svelte
		のランタイム向けの JavaScript を出力できます。<code>rsvelte_svue</code> はこの仕組みを使い、<code>.vue</code> のコンポーネントを
		<strong>Vue の意味のまま</strong> Svelte のランタイム向けにコンパイルします。新しい言語は足さず、<code>.vue</code> の文書に適用するタスク
		<code>svue.compile/client</code> と <code>svue.compile/server</code> を足すだけです。翻訳は Vue プラグインの構文解析と名前解決の結果を読みます。翻訳した結果には、Svelte プラグインの名前解決、解析、出力を使います。<code>rsvelte_svue</code> が持っているのは、Vue の構文木から Svelte の runes を使うスクリプトと
		コンパイル用に整理した構文木を作る翻訳だけです。
	</p>
</div>

<Code item={data.code.svueRegister} />
<Code item={data.code.svueTranslated} />
<Code item={data.code.svueInput} />

<div class="prose-learn">
	<p>
		書き方が同じでも、二つのランタイムでは意味が違います。Vue の <code>{'{{ e }}'}</code> は <code>toDisplayString</code>
		を通るので、オブジェクトは <code>JSON.stringify</code> と同じ形の文字列になります。Svelte の <code>{'{e}'}</code> は <code>String(e)</code> です。また Vue
		では、渡されなかった <code>Boolean</code> の prop は <code>false</code> になり、宣言していない属性はルート要素に引き継がれます。
	</p>
	<p>
		翻訳はこうした違いを近似せず、Vue 自身の実装を呼んで再現します。
	</p>
	<ul>
		<li>補間: <code>vue</code> の <code>toDisplayString</code> を呼びます。</li>
		<li><code>v-for</code>: <code>renderList</code> を呼びます。</li>
		<li><code>Boolean</code> の prop: runtime-core の <code>resolvePropValue</code> を写した <code>$derived.by</code> にします。</li>
		<li>サーバー向けの <code>v-model</code>: compiler-ssr が出力するのと同じ属性にします。</li>
	</ul>
	<p>
		svue には上流のコンパイラがないので、比較元は出力の文字列ではなく動作です。公式の Vue でビルドしたコンポーネントについて、操作の手順ごとに画面の要素の木とサーバー描画の結果を記録します。それを、rsvelte
		の出力を Svelte のランタイムで動かした記録と比べます。
	</p>
	<p>
		Svelte の移植は svue のために変えていません。Svelte の移植はどれも上流の <code>svelte/compiler</code>
		と出力を突き合わせる、という規則を守るためです。Svelte プラグインに足したのは、別の言語から渡された文字列をテキストとして構文木に置く
		<code>compiler_syntax_tree::spelled_text</code> だけです。足す前後で <code>svelte.compile</code> の出力はバイト単位で一致しました（ed7af962b2）。
	</p>
	<p>
		翻訳が出力するのは、Svelte の移植が上流と同じにコンパイルできる構文だけです。Vue のテキストは空白をすでに畳んでいるので、Svelte
		のコンパイラは上流の <code>preserveWhitespace</code> オプションを付けて走らせ、空白を二度畳まないようにします。ルートに引き継ぐ属性は
		<code>{'{...attrs}'}</code> にし、<code>class</code> は runtime-core の <code>mergeProps</code> と同じ規則で合成します。Vue は props に
		<code>class</code> のキーがあるときだけ属性を書きます。そのため、自分の <code>class</code> を持たない要素では、スプレッド構文の中で合成します。動作の比較では、見えない空白と空の
		<code>class</code> 属性を区別できません。この二つは crate のテストで固定しています。
	</p>
</div>

<Code item={data.code.svueClass} />

<div class="prose-learn">
	<p>
		導入したコミットでは、手書きの 12 検証例のうち、クライアント用で 4、サーバー用で 7 が一致しました。残りは拒否で、不一致は 0 でした（73c8eea9c1）。拒否したのは、翻訳は書いてあるものの、Svelte
		の移植がその構文をまだコンパイルできないものだけでした。対象はクライアント用の <code>v-model</code>（<code>{'{@attach}'}</code>
		で Vue の <code>vModelText</code> などを走らせる）、ルートへの属性の引き継ぎ（<code>{'{...attrs}'}</code>）、<code>&lt;select&gt;</code>
		です。Svelte の移植がこれらに対応してからは、クライアント用とサーバー用の両方で 12 検証例すべてが一致します。
	</p>
	<p>
		Vue の移植の側には、<code>v-on</code> の修飾子を足しました。<code>vue.compile</code> も compiler-dom と同じく、<code>withModifiers</code> と <code
			>withKeys</code
		> を使って出力します。
	</p>
	<p>
		この仕組みの前段として、Svelte プラグインの解析と出力は、元の構文木ではなくコンパイル用に整理した構文木を読むように移してあります。この構文木は外部から作れます。属性名は元のソース内の位置だけでなく、文字列としても持てます。たとえば
		Vue の <code>@click</code> は <code>onclick</code> という名前になりますが、元のソースにはその名前は書かれていません。移したときは、Svelte の検証用のソースファイル集で
		compile・format・lint の出力 70,608 ファイルのハッシュが前後で一致しました（db94f0bd13）。
	</p>

	<H2 id="vuelte" />
	<p>
		<code>rsvelte_svelte_compile_vapor</code> compiles Svelte components to Vue Vapor.
		It shares parsing, name resolution, normalization, and analysis with <code>svelte.compile</code>.
		The translation builds new trees. A Rust backend emits element factories and render effects from those trees.
		The task identifiers remain <code>vuelte.compile/client</code> and <code>vuelte.compile/server</code>.
		The server target keeps the Vue server rendering backend. Hydration is not supported.
	</p>
</div>

<Code item={data.code.vuelteRegister} />
<Code item={data.code.vuelteModule} />

<div class="prose-learn">
	<p>
		vuelte にも上流のコンパイラがないので、比較元は動作です。公式の Svelte でビルドしたコンポーネントを画面に表示し、操作の手順ごとに画面の要素の木とサーバー描画の結果を記録します。それを、rsvelte
		の出力を Vue のランタイムで動かした記録と比べます。
	</p>
	<p>
		Svelte の要素への束縛は、Vapor の <code>renderEffect</code> の中で動きます。effect は読んだ値を追跡し、値が変わると要素を更新します。
		分岐、繰り返しの一つの要素、コンポーネントが取り除かれると、<code>onScopeDispose</code> が要素への束縛を片付けます。
	</p>
</div>

<Code item={data.code.vuelteRef} />
<Code item={data.code.vuelteBindText} />

<div class="prose-learn">
	<p>動作の比較で見つかった違い（<code>docs/fixtures.md</code> §12.8）は、それぞれ次のように再現しています。</p>
	<ul>
		<li>
			補間: Vue の <code>toDisplayString</code> は、オブジェクトを <code>JSON.stringify</code> と同じ形の文字列にします。翻訳は、先に Svelte
			と同じ変換をしてから渡します。クライアント用は <code>{'`${e ?? \'\'}`'}</code>、サーバー用は <code>{"String(e ?? '')"}</code> です。
		</li>
		<li>
			要素の間の空白: Svelte の <code>clean_nodes</code> が残したテキストを、そのまま Vue の構文木に入れます。Vue の空白の畳み込みは、構文木を作った後には走りません。
		</li>
		<li>渡されなかった prop: <code>defineProps</code> に <code>type</code> を書かないので、Vue の <code>Boolean</code> への変換が起きません。</li>
		<li>
			宣言していない属性: すべてのコンポーネントに <code>defineOptions({'{ inheritAttrs: false }'})</code> を付けます。<code
				>{'let { ...rest } = $props()'}</code
			> は <code>useAttrs()</code> にします。スプレッド構文を持つ要素では、すべての属性を一つのオブジェクトにまとめます。それを Svelte の
			<code>set_attributes</code>（クライアント用）と <code>attributes</code>（サーバー用）を移植した補助関数に渡します。
		</li>
		<li>数値と範囲の入力欄の <code>bind:value</code>: 文字列ではなく数値として読み書きします。</li>
	</ul>
	<p>
		再現できない構文は、それらしく変換せずに、出力を作る前に拒否します。たとえば、アタッチメント、action、トランジション、アニメーションの式の中の
		<code>await</code> は拒否します。どこまで対応しているかは <code>crates/languages/svelte/compile_vapor/COVERAGE.md</code> にまとめています。
	</p>
	<p>
		導入したコミット（24c6e6a123）では、手書きの 12 検証例のうち 11 で、クライアント用とサーバー用の両方が一致しました。残りの一つはスプレッド構文の属性で、拒否していました。スプレッド構文に対応した後（6b5621c994）は、12
		検証例すべてが一致します。Svelte の検証用のソースファイル集では、クライアント用 685 件、サーバー用 686 件を出力し、異常終了は 0 件です。出力はどれも、公式の
		Svelte と並べて動かしたとき、表示した時点の記録が一致しました。両方が同じ例外を投げるものも含みます。
	</p>
	<p>
		Vue の移植の側に足したのは、<code>defineOptions</code>、<code>&lt;pre&gt;</code>、関数の <code>:ref</code>、オブジェクトの <code
			>v-bind</code
		> の四つです。足す前後で、Vue の検証例のコンパイル出力は変わっていません。
	</p>

	<H2 id="lint" />
	<p>
		ルールは、自分の問いに答える層を文書のコンテキストから求めます。どの層を読むかは、ルールごとに違います。
	</p>
	<ul>
		<li>
			<code>no-unused-vars</code> は元の構文木と名前解決を読みます。ESLint の移植で、親の要素の種類や宣言の書き方を見て判断するので、書かれたとおりの木が要ります。
		</li>
		<li>
			<code>svelte/button-has-type</code> は元の構文木だけを読みます。属性の値の部品がすべて文字列なら静的な値として判定し、式を含む値は判定しません。
		</li>
		<li>
			<code>svelte/valid-each-key</code> は、コンパイル用に整理した構文木の <code>{'{#each}'}</code> と名前解決を読みます。
		</li>
	</ul>
	<p>
		Svelte プラグインでは、設定の中の各ルール（<code>RuleConfiguration</code>）が <code>Rule</code> を実装し、必要な層をその場で求めます。<code>rsvelte_lint</code>
		の <code>Findings</code> は、ルールを設定の順に走らせて、一つの並びにまとめます。同じ位置の指摘は、ルールの順になります。
	</p>
</div>

<Code item={data.code.findings} />
<Code item={data.code.lint} />
<Code item={data.code.ruleImpl} mark={['.get::<Parsed>()', 'no_unused_variables::check(context, self.identifier(), out)', 'valid_each_key::check(context, out)']} />
<Code item={data.code.button} mark={['static_problem(component, source, attribute, allowed)', 'AttributeValue::True', 'None if !shorthand && !spread']} />
<Code item={data.code.staticProblem} mark={['let Part::Text(span) = part else', 'check_static(&value, allowed)']} />

<div class="prose-learn">

	<H2 id="shared-lint" />
	<p>
		Svelte と Vue の公式プラグインには、ボタンの種類を調べるルールが別々に実装されています。
		それぞれ <code>svelte/button-has-type</code> と <code>vue/html-button-has-type</code> です。rsvelte
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
		Vue と Svelte のルールは、どちらもそれぞれの言語の元の構文木の上で書かれています。木の形が違っても、判断を共有するのに困ることはありません。共有しているのは木ではなく、値についての判断だからです。
	</p>
	<p>
		<code>vue/html-button-has-type</code> はこのとき新しく足したルールで、<code>vue.lint</code> は 19 検証例中 19 で比較元の公式ツールと一致しました。報告の範囲を引用符の分だけずらすと
		18/19 に落ちることを対照として確かめています。<code>svelte.lint</code> は 12/12 のままでした（5c933023a7）。
	</p>

	<H2 id="next" />
	<Caution>ここから先は計画です。型の項だけは試作のコードがあります。</Caution>
	<ul>
		<li>
			型: 型を使う lint の試作（<code>rsvelte_svelte_lint_typed</code>）があります。今は構文と名前解決から型を推論し（<code>TypeFacts::infer</code>）、共通の呼び出し窓口から受け取ります。tsgo から引き、<code>CompilerNodeIdentifier</code>
			と式の <code>NodeIdentifier</code> で引く表にするのは、まだ計画です。型を持つ層は、コンパイル用に整理した構文木とは別の計算結果です。
		</li>
		<li>
			制御フローとデータフロー: コンパイル用に整理した構文木とは別の構造にします。基本ブロックと辺の表、それに <code>$state</code> と
			<code>$derived</code> の依存のグラフです。要素は コンパイル用に整理した構文木の番号を指します。
		</li>
		<li>
			出力: クライアントとサーバーの JavaScript は、すでに コンパイル用に整理した構文木から作っています。型検査用に生成する TypeScript コード（<code>ts.view</code>
			の Svelte の答え）は、まだ元の構文木から作っています。これを コンパイル用に整理した構文木とデータフローの層から作るように移すと、コンパイラ、lint、型検査が同じ判断を共有します。
		</li>
		<li>
			独自のツール: 新しいツールはタスクを一つ書き、必要な層を <code>context.get</code> で求めるだけです。既存のタスクと同じ層を読むなら、その層は計算し直されません。
		</li>
	</ul>
</div>

<ChapterFooter chapter={c} />
