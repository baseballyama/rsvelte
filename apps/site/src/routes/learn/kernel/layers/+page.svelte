<script lang="ts">
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
		{ name: 'svelte.hir', layer: 'HIR', what: 'コンパイラが理解する形のテンプレート。', readers: 'compile, lint' },
		{ name: 'svelte.analyze', layer: 'コンパイラの派生', what: '式の依存、動的な断片、CSS が選ぶ要素。HIR と名前解決を読む。', readers: 'compile' },
		{ name: 'svelte.css', layer: '出力', what: 'スコープを付けた CSS。', readers: 'compile' },
		{ name: 'ts.view', layer: '出力（ファセット）', what: '型検査が読む TypeScript。Svelte の答えは表層の木から作る。', readers: 'check' }
	];
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="パースした木は、書かれたとおりの形をしています。lint や型検査が知りたいのは、それが何を意味するかです。この章では、構文木の上に名前解決と HIR を一枚ずつ重ね、ルールやツールが必要な層だけを読む仕組みを見ます。"
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
		Rust のコンパイラ rustc は、AST から HIR、型、MIR へと層を重ねます。各層は前の層を読んで事実を足し、lint
		や解析ツールは自分の問いに答える層を読みます。rsvelte も同じ形を取ります。層はカーネルにとってはただのアーティファクトなので、仕組みとして新しく必要なのは二つだけです。層ごとに振る番号と、番号で引く表です。
	</p>

	<H2 id="ids" />
	<p>
		層は、自分の扱うものに 0 から番号を振ります。その番号についてあとの層が知った事実は、木に書き込まず、番号で引く表（side table）に置きます。木は一度作ったら変わりません。
	</p>
	<p>
		番号には型を付けます。<code>Idx</code> は番号の型が満たすトレイトで、<code>newtype_index!</code> が番号の型を作ります。中身は
		<code>u32</code> ではなく、番号に 1 を足した <code>NonZeroU32</code> です（理由は次の節）。
	</p>
</div>

<Code item={data.code.idx} />
<Code item={data.code.newtype} />

<div class="prose-learn">
	<p>
		<code>IndexVec&lt;I, T&gt;</code> は、<code>I</code> でしか引けない <code>Vec</code> です。束縛の表をスコープの番号で引こうとすると、実行時に間違った値を返すのではなく、コンパイルが通りません。
	</p>
</div>

<Code item={data.code.indexVec} />
<Code item={data.code.fromElem} />

<div class="prose-learn">
	<p>
		<code>rsv_js</code> のスコープ解析は、この型を最初に使った場所です。<code>BindingId</code> と <code>ScopeId</code>
		は型付きの番号になり、ルートのスコープの親は番兵の <code>u32::MAX</code> ではなく <code>None</code> になりました。例外は、節点ごとの束縛を引く表です。これは今も生の
		<code>u32</code> に番兵 <code>u32::MAX</code> を入れる形で持ち、外には <code>binding_of</code> だけを見せています。この形を選んだ当時は
		<code>Option&lt;BindingId&gt;</code> が 8 バイトだったためで、次の節の変更のあとは <code>Option&lt;BindingId&gt;</code> も 4 バイトです。
	</p>

	<DeepDive title="層どうしの対応も表で持つ">
		<p>
			層を一つ下げると、「この節点は上の層のどれから来たか」という対応が必要になります。これも表です。HIR は <code
				>origin: IndexVec&lt;HirId, TId&gt;</code
			>
			を持ち、HIR の各節点を作った表層の節点を覚えています。図 5.1 で HIR の行に付いている <code>← n</code> がそれです。
		</p>
	</DeepDive>

	<H2 id="niche" />
	<p>
		番号の型の中身を <code>NonZeroU32</code> にすると、Rust は 0 という値が使われないことを知っているので、<code>Option&lt;Id&gt;</code>
		の <code>None</code> を 0 で表せます（ニッチ最適化）。<code>Option&lt;Id&gt;</code> は <code>Id</code> と同じ 4 バイトになり、「親があるかもしれない」「参照先があるかもしれない」という欄が、ない場合の番兵なしで書けます。rustc
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
		をそれぞれの型の隣に置き、欄を一つ足して型が広がると、性能のラチェットで気づく前にビルドが止まります。大きさを変えることは、偶然ではなく判断になります。
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
		文書 IR の <code>Node</code> を 16 バイトにする案（<code>&amp;'static str</code> の <code>Static</code> をやめ、リテラルもテキストのバッファに写す）も測られています。命令数もバイト数も増えたので、採用していません（36c3539efb）。
	</p>

	<H2 id="tokens" />
	<p>
		いちばん下の層は、書かれたものを何も落としてはいけません。構文木を AST にするか CST にするかは言語ごとに決めてよく、カーネルはそこに口を出しません。カーネルが求めるのは一つだけで、表層の層が持つトークンを、空白とコメントも含めて順に並べると、ソースとバイト単位で一致することです。この性質は言語を知らなくても確かめられます。
	</p>
</div>

<Code item={data.code.lossless} />

<div class="prose-learn">
	<p>
		トークン表は文書ごとに作っては捨てるので、そのバッファもスレッドのプールから借りて返します（<a href="/learn/kernel/pool#users">12</a>）。
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
		Svelte のトークンは、マークアップのトークンと、JavaScript のパーサが消費したトークンとコメント、その間の空白です。スタイルシートは、CSS
		のパーサが自分のトークンを記録するまでは一つの <code>Css</code> トークンです。
	</p>
</div>

<Code item={data.code.tk} />

<div class="prose-learn">
	<p>
		トークン表を入れたのと同時に、道具がソースを覗いて推測していた二つの事実、属性が省略形 <code>{'{a}'}</code>
		で書かれたかとタグが <code>/&gt;</code> で閉じたかを、表層の木に記録しました。HIR、型検査の射影、整形の三か所にあった
		<code>src.as_bytes()[…]</code> がなくなっています。
	</p>
	<p>
		コーパスのうちパーサが受け付ける 5,410 ファイルで、トークン表がソースと一致することをテストで確かめています（トークン 882,917 個、4,259,323
		バイト）。属性のテキストを記録しない版と、JavaScript のコメントを空白として記録する版を作ると、このテストはそれぞれ
		3,602 ファイルと 303 ファイルで落ちます。出力はコーパス全体で一つも変わっていません。記録の費用は、1 スレッドで全コーパスを処理する時間の中央値で
		451 ms から 459 ms（約 1.7%）です。最初は 3.5% で、そのほとんどは JavaScript のトークン表が文書ごとに空から伸びることでした。
	</p>

	<H2 id="stack" />
	<p>Svelte プラグインの層と、それぞれを読むタスクです。</p>
</div>

<figure class="my-8 overflow-x-auto">
	<table class="table">
		<thead><tr><th>アーティファクト</th><th>層</th><th>中身</th><th>読むタスク</th></tr></thead>
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
		以前、この情報はコンパイラの解析結果（<code>Analysis</code>）の一部でした。そのため lint は、スコープを知りたいだけなのに、CSS
		のセレクタの照合まで含むコンパイラの解析をまるごと計算していました。今は <code>Resolved</code> を求めるだけです。<code>Analysis</code>
		は、名前解決の上にコンパイラだけが必要とする事実を足す層になりました。
	</p>
</div>

<Code item={data.code.resolve} />

<div class="prose-learn">
	<H2 id="hir" />
	<p>
		HIR は、テンプレートをコンパイラが理解する形に直したものです。作るときに読むのは表層の木で、ソースのテキストを読むのは名前と、文字参照を展開するテキストだけです。コンパイラの解析（<code
			>svelte.analyze</code
		>）とクライアント・サーバーの出力は、表層の木ではなく HIR を読みます。
	</p>
	<ul>
		<li><code>{'{#if}…{:else if}…{:else}'}</code> は、入れ子の <code>If</code> ではなく、枝を並べた一つの節点になります。</li>
		<li>要素は種類を持ちます。通常の要素、コンポーネント、<code>{'<svelte:head>'}</code> の中の <code>{'<title>'}</code>、<code
				>{'<slot>'}</code
			>、<code>svelte:</code> のメタタグです。</li>
		<li>属性の値は、論理属性、静的な文字列（文字参照は展開済み）、式一つ、省略形、補間に分類されます。</li>
		<li>テキストは文字参照を展開します。</li>
		<li>すべての節点が <code>HirId</code>、親、表層での出所を持ちます。</li>
	</ul>
</div>

<Code item={data.code.hir} />
<Code item={data.code.attrValue} />

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
		<code>element_kind</code> は <code>HirBuilder</code> のメソッドです。<code>HirBuilder</code> は公開された型で、Svelte
		の表層の木を知りません。節点を足し、子の並びを記録し、祖先をたどって要素の種類を決めるだけです。Svelte の表層の木から HIR を作るのは、その上に書かれた
		<code>SurfaceBuilder</code> です。
	</p>
</div>

<Code item={data.code.hirBuilder} />

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
		コンパイラが HIR だけを読むので、HIR を作れるフロントエンドがあれば、同じコンパイラで Svelte のランタイム向けの JavaScript
		を出せます。<code>rsv_svue</code> はそれを使って、<code>.vue</code> のコンポーネントを <strong>Vue の意味のまま</strong> Svelte
		のランタイム向けにコンパイルします。自分の言語は持たず、Vue の言語にタスク <code>svue.behaviour/client</code> と
		<code>/server</code> を足すだけです。パースと名前解決は Vue プラグインのアーティファクト、解析と出力は Svelte
		プラグインのコンパイラで、<code>rsv_svue</code> が持っているのは、Vue の木から runes のスクリプトと Svelte の HIR を作る翻訳だけです。
	</p>
</div>

<Code item={data.code.svueRegister} />
<Code item={data.code.svueTranslated} />
<Code item={data.code.svueInput} />

<div class="prose-learn">
	<p>
		同じ見た目の書き方でも、二つのランタイムの意味は違います。<code>{'{{ e }}'}</code> は Vue では <code>toDisplayString</code>
		（オブジェクトは JSON）で、Svelte の <code>{'{e}'}</code> は <code>String(e)</code> です。渡されなかった <code>Boolean</code>
		の prop は Vue では <code>false</code> で、宣言していない属性はルート要素に引き継がれます。翻訳はそれを近似せず、Vue
		自身の実装を呼ぶ形で再現します: 補間は <code>vue</code> の <code>toDisplayString</code>、<code>v-for</code> は
		<code>renderList</code>、<code>Boolean</code> の prop は runtime-core の <code>resolvePropValue</code> を写した
		<code>$derived.by</code>、server の <code>v-model</code> は compiler-ssr が出す属性です。上流のコンパイラが無いので、オラクルは振る舞いです。公式の
		Vue でビルドしたコンポーネントの、操作手順ごとの DOM と SSR の HTML を、rsvelte の出力を Svelte のランタイムで動かした記録と比べます。
	</p>
	<p>
		Svelte の移植は svue のために変えません。どの lower も上流の <code>svelte/compiler</code>
		と突き合わせる、という規則を守るためです。Svelte プラグインに足したのは、フロントエンドが綴ったテキストを HIR に置く
		<code>hir::spelled_text</code> だけで、足す前後で <code>svelte.compile</code> の出力はバイト一致しました（ed7af962b2）。翻訳が出すのは、Svelte
		の移植が上流と同じに lower する構文だけです。Vue のテキストは空白を畳み済みなので、Svelte のコンパイラは上流の <code>preserveWhitespace</code>
		オプションで走らせ、二度目の掃除をさせません。ルートに引き継ぐ属性は <code>{'{...attrs}'}</code> にし、<code>class</code>
		は runtime-core の <code>mergeProps</code> と同じに合成します。Vue は props に <code>class</code> のキーがあるときだけ属性を書くので、自分の
		<code>class</code> が無い要素では、スプレッドの中で合成します。振る舞いのオラクルは見えない空白と空の <code>class</code>
		属性を区別しないので、この二つは crate のテストで固定しています。
	</p>
</div>

<Code item={data.code.svueClass} />

<div class="prose-learn">
	<p>
		導入したコミットでは、手書きの 12 ユニットのうち client で 4、server で 7 が一致し、残りは拒否で、不一致は 0 でした（73c8eea9c1）。拒否はすべて、client の
		<code>v-model</code>（<code>{'{@attach}'}</code> で Vue の <code>vModelText</code> などを走らせる）、ルートへの属性の引き継ぎ（<code
			>{'{...attrs}'}</code
		>）、<code>&lt;select&gt;</code> のように、翻訳は書いてあって Svelte の移植がその構文を lower していないものでした。Svelte
		の移植がそれらを lower するようになってからは、両ターゲットで 12 ユニットすべてが一致します。Vue の移植の側に足したのは <code>v-on</code>
		の修飾子で、<code>vue.compile</code> も compiler-dom と同じく <code>withModifiers</code> と <code>withKeys</code>
		で出力します。
	</p>
	<p>
		この仕組みの前段として、Svelte プラグインの解析と出力は表層の木ではなく HIR を読むように移してあり、HIR には公開の builder
		と、ソースの範囲ではなく名前として持つ属性名があります（Vue の <code>@click</code> は <code>onclick</code>
		という名前で、ソースのどこにも <code>onclick</code> とは書かれていません）。移したときは、Svelte のコーパスで compile・format・lint の出力
		70,608 ファイルのハッシュが前後で一致しました（db94f0bd13）。
	</p>

	<H2 id="vuelte" />
	<p>
		逆向きもあります。<code>rsv_vuelte</code> は <code>.svelte</code> を、Svelte の意味のまま Vue のランタイム向けの JavaScript
		にコンパイルします。自分の言語は持たず、Svelte の言語にタスク <code>vuelte.behaviour/client</code> と <code>/server</code>
		を足すだけです。パース・名前解決・HIR・解析は <code>svelte.compile</code> と同じアーティファクトを使い、出力は Vue
		プラグインの名前解決とコンパイラです。<code>rsv_vuelte</code> が持っているのは、Svelte の HIR から Vue の HIR
		とスクリプトを作る翻訳だけです。
	</p>
</div>

<Code item={data.code.vuelteRegister} />
<Code item={data.code.vuelteModule} />

<div class="prose-learn">
	<p>
		上流のコンパイラが無いので、オラクルは振る舞いです。公式の Svelte でビルドしたコンポーネントを DOM にマウントし、操作手順ごとの DOM と SSR
		の HTML を記録して、rsvelte の出力を Vue のランタイムで動かした記録と比べます。同じ見た目の書き方でも二つのランタイムの意味は違うので（補間の表示、要素の間の空白、<code
			>value</code
		> を属性にも書くかどうか）、翻訳は Svelte のランタイムの判断を Vue の上で再現します。たとえば Svelte の束縛は要素への effect
		なので、Vue が要素の patch のたびとアンマウントのときに呼ぶ関数 ref の中で動かします。
	</p>
</div>

<Code item={data.code.vuelteRef} />
<Code item={data.code.vuelteBindText} />

<div class="prose-learn">
	<p>オラクルが表に出した違い（<code>docs/fixtures.md</code> §12.8）は、それぞれ次のように写しています。</p>
	<ul>
		<li>
			補間: Vue の <code>toDisplayString</code> はオブジェクトを JSON にします。翻訳は先に Svelte の強制（client は <code
				>{'`${e ?? \'\'}`'}</code
			>、server は <code>{"String(e ?? '')"}</code>）をかけてから渡します。
		</li>
		<li>要素の間の空白: Svelte の <code>clean_nodes</code> が残したテキストを Vue の HIR に入れます。Vue の空白の畳み込みは HIR を作った後には走りません。</li>
		<li>渡されなかった prop: <code>defineProps</code> に <code>type</code> を書かないので、Vue の Boolean への変換が起きません。</li>
		<li>宣言していない属性: すべてのコンポーネントに <code>defineOptions({'{ inheritAttrs: false }'})</code> を付けます。</li>
		<li>数値の入力欄の <code>bind:value</code>: 意味を写せないので拒否します。</li>
	</ul>
</div>

<div class="prose-learn">
	<p>
		写せない構文は、それらしく変換せずに出力の前に拒否します。導入したコミットでは、手書きの 12 ユニットのうち 11 で client と server
		の両方が一致し、残る 1 つ（spread 属性）は拒否しました。Svelte のコーパスでは client 673 件・server 674 件を出力し、panic は 0
		件でした（24c6e6a123）。Vue の移植の側に足したのは、<code>defineOptions</code>、<code>&lt;pre&gt;</code>、関数の
		<code>:ref</code> の三つで、足す前後で Vue のフィクスチャのコンパイル出力はバイト一致しています。
	</p>

	<H2 id="lint" />
	<p>
		ルールは、自分の問いに答える層の上で書きます。rustc と同じく、構文木を読むルールを <dfn>early</dfn>、下げた層を読むルールを
		<dfn>late</dfn> と呼びます。
	</p>
	<ul>
		<li>
			<code>no-unused-vars</code> は early のままです。ESLint の移植で、親の節点の種類や宣言の書き方を見て判断するので、書かれたとおりの木が要ります。
		</li>
		<li>
			<code>svelte/button-has-type</code> は late です。知りたいのは属性の値が静的な文字列かどうかで、HIR ではそれがすでに分類されています。
		</li>
	</ul>
	<p>
		カーネルの <code>Findings</code> は、層ごとのルールの組を順に走らせて、一つの並びにまとめます。同じ位置の指摘は、先に走った層、同じ層の中ではルールの順になります。
	</p>
</div>

<Code item={data.code.findings} />
<Code item={data.code.lint} />
<Code item={data.code.button} mark={['AttrValue::Boolean', 'AttrValue::Static(v) => check_static(v, Allowed::default())', 'AttrValue::Shorthand(_)']} />

<div class="prose-learn">
	<p>
		移したあとも出力は変わっていません。移す前（<code>dcf796e11a</code>）と移したあと（<code>1789210b8e</code>）のバイナリで全コーパスを走らせ、出力
		88,094 ファイルのハッシュを比べると、変わったものは 0 でした。lint の出力は 17,488 ファイルで、そのうち
		<code>button-has-type</code> の指摘は「type がない」が 580 件、「値が空」が 2 件、「値が不正」が 1 件あります。
	</p>
	<p>
		0 という結果は、変化を見分けられる測り方でなければ意味を持ちません。そこで「値が不正」の分岐だけを潰したバイナリを作って同じ比較をすると、変わったのは
		1 ファイルで、その指摘を持つ唯一のファイルと一致しました。
	</p>

	<H2 id="shared-lint" />
	<p>
		上流では、<code>svelte/button-has-type</code>（eslint-plugin-svelte）と <code>vue/html-button-has-type</code>（eslint-plugin-vue）は、一つのルールを写した二つの実装です。rsvelte
		では判断の部分、つまり <code>type</code> が取れる値、四つのメッセージ、オプションを <code>rsv_html::button_type</code> の一つの関数にしています。
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
			Vue は静的な <code>type</code> を先に探してから <code>:type</code> を見て、属性名を大文字小文字の区別なく比べ、指摘は値の節点（引用符を含む）に付きます。
		</li>
	</ul>
</div>

<Code item={data.code.vueButton} mark={['check_static(&text, Allowed::default())', 'value_node(v, a.quoted)']} />

<div class="prose-learn">
	<p>
		Vue のルールは late の層を持たないので、表層の木の上で書かれています。Svelte のルールは HIR の上です。層が違っても、判断を共有するのに困ることはありません。共有しているのは層ではなく、値についての判断だからです。
	</p>
	<p>
		<code>vue/html-button-has-type</code> はこのとき新しく足したルールで、<code>vue.lint</code> は 19 ユニット中 19 でオラクルと一致しました。報告の範囲を引用符の分だけずらすと
		18/19 に落ちることを対照として確かめています。<code>svelte.lint</code> は 12/12 のままでした（5c933023a7）。
	</p>

	<H2 id="next" />
	<Caution>ここから先は計画で、まだコードはありません。</Caution>
	<ul>
		<li>
			<strong>型</strong>: tsgo から引き、<code>HirId</code> と式の <code>NodeId</code> で引く表にします。型を持つ層は、HIR
			とは別のアーティファクトです。
		</li>
		<li>
			<strong>制御フローとデータフロー</strong>: HIR とは別の構造にします。基本ブロックと辺の表、それに <code>$state</code> と
			<code>$derived</code> の依存のグラフです。節点は HIR の番号を指します。
		</li>
		<li>
			<strong>出力</strong>: クライアントとサーバーの JavaScript は、すでに HIR から作っています。TypeScript の射影（<code>ts.view</code>
			の Svelte の答え）は、まだ表層の木から作っています。これを HIR とデータフローの層から作るように移すと、コンパイラ、lint、型検査が同じ判断を共有します。
		</li>
		<li>
			<strong>独自のツール</strong>: 新しいツールはタスクを一つ書き、必要な層を <code>ctx.get</code> で求めるだけです。既存のタスクと同じ層を読むなら、その層は計算し直されません。
		</li>
	</ul>
</div>

<ChapterFooter chapter={c} />
