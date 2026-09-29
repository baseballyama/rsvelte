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
		{ name: 'svelte.hir', layer: 'HIR', what: 'コンパイラが理解する形のテンプレート。', readers: 'lint' },
		{ name: 'svelte.analyze', layer: 'コンパイラの派生', what: '式の依存、動的な断片、CSS が選ぶ要素。', readers: 'compile' },
		{ name: 'svelte.css', layer: '出力', what: 'スコープを付けた CSS。', readers: 'compile' },
		{ name: 'svelte.project.ts', layer: '出力', what: '型検査が読む TypeScript。', readers: 'check' }
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
	<p>番号には型を付けます。<code>Idx</code> は番号の型が満たすトレイトで、<code>newtype_index!</code> が <code>u32</code> を包んだ型を作ります。</p>
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
		は型付きの番号になり、ルートのスコープの親は番兵の <code>u32::MAX</code> ではなく <code>None</code> になりました。例外は、節点ごとの束縛を引く表です。文書のすべての節点に一つずつ要素があるので、<code
			>Option&lt;BindingId&gt;</code
		>（8 バイト）ではなく生の <code>u32</code> で持ち、外には <code>binding_of</code> だけを見せています。
	</p>

	<DeepDive title="層どうしの対応も表で持つ">
		<p>
			層を一つ下げると、「この節点は上の層のどれから来たか」という対応が必要になります。これも表です。HIR は <code
				>origin: IndexVec&lt;HirId, TId&gt;</code
			>
			を持ち、HIR の各節点を作った表層の節点を覚えています。図 5.1 で HIR の行に付いている <code>← n</code> がそれです。
		</p>
	</DeepDive>

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
		HIR は、テンプレートをコンパイラが理解する形に直したものです。作るときに読むのは表層の木だけで、ソースを読むのは名前と、表層の木が記録していない「省略形
		<code>{'{a}'}</code> で書いたか」だけです。
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
<Code item={data.code.button} mark={['AttrValue::Boolean', 'AttrValue::Static(v) if v.is_empty()', 'AttrValue::Shorthand(_)']} />

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
			<strong>出力</strong>: クライアントとサーバーの JavaScript、TypeScript の射影は、今は表層の木から作っています。HIR
			とデータフローの層から作るように移すと、コンパイラと lint が同じ判断を共有します。
		</li>
		<li>
			<strong>独自のツール</strong>: 新しいツールはタスクを一つ書き、必要な層を <code>ctx.get</code> で求めるだけです。既存のタスクと同じ層を読むなら、その層は計算し直されません。
		</li>
	</ul>
</div>

<ChapterFooter chapter={c} />
