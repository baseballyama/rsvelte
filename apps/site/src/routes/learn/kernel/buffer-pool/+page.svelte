<script lang="ts">
	import Term from '$lib/components/Term.svelte';
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import DeepDive from '$lib/components/DeepDive.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import PoolViz from '$lib/widgets/PoolViz.svelte';

	let { data } = $props();
	const c = chapter('pool');
	const pct = (a: number, b: number) => ((1 - a / b) * 100).toFixed(0);
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="一つのワーカーは文書を次々に処理します。前の文書の構文木が使い終わったベクタの容量を、次の文書がそのまま使えば、伸ばすための確保がほとんど要らなくなります。"
/>

<div class="prose-learn">
	<H2 id="idea" />
	<p>
		<code>rsvelte_typescript</code> の構文木<code>SyntaxTree</code> は、ノードの種類、フラグ、データ、位置などを列ごとのベクタに持っています。文書を一つパースすると、それぞれのベクタがノードの数まで伸び、そのたびに確保し直します。文書が終わると木は捨てられ、次の文書でまた
		0 から伸ばします。
	</p>
	<p>
		<code>pool</code> は、捨てる木のベクタを中身だけ空にしてスレッドローカルに取っておき、次に作る木に渡します。木は作るときにバッファを借り（<code
			>take</code
		>）、<code>Drop</code> で返します（<code>give</code>）。
	</p>

	<H2 id="take-give" />
</div>

<Code item={data.code.take} />
<Code item={data.code.give} />

<div class="prose-learn">
	<p>
		どちらも中身は <code>take_at</code> と <code>give_at</code> で、違うのは保存先を選ぶ鍵だけです。プールの中身は、鍵（<code>TypeIdentifier</code>）ごとの生のポインタと容量と
		<code>Layout</code> の列、それに全体で持っているバイト数です。
	</p>
</div>

<Code item={data.code.pool} />
<Code item={data.code.takeAt} />

<div class="prose-learn">
	<p>
		<code>take_at</code> はバッファを <code>Vec::from_raw_parts</code> で長さ 0 として組み立て直します。長さ 0
		のベクタは中身を読まないので、型さえ合っていれば安全です。型が合うことは鍵が保証します。鍵は <code>T</code> を包んだ印の型 <code>Plain&lt;T&gt;</code> か、<code>K</code> と <code>T</code> を包んだ
		<code>Keyed&lt;K, T&gt;</code> の <code>TypeIdentifier</code> で、どちらの鍵の下にも <code>Vec&lt;T&gt;</code> から来たバッファしか入りません。
	</p>
</div>

<PoolViz />

<div class="prose-learn">
	<H2 id="keyed" />
	<p>
		以前のプールは、要素の型だけを鍵にしていました。すると、同じ要素型の列を持つ別々の構造が、同じ保存先からバッファを取り合います。たとえば文書の名前を貯める
		Interner の <code>buffer</code> と、整形器の出力バッファは、どちらも <code>u8</code> のバッファです。片方が大きなバッファを返すと、もう片方が次の文書でそれを受け取り、さらに伸ばして返します。互いに相手の大きさまで伸ばし合うので、どちらかをプールに入れると、もう一方の性能や結果を悪化させる変更として現れていました。
	</p>
	<p>
		そこで、持ち主の型も鍵に含める <code>take_keyed::&lt;K, T&gt;</code> と <code>give_keyed</code> を足しました。<code>K</code>
		は構造体そのもの（<code>SyntaxTree</code>、<Term name="LayoutInstructions" />、<code>Component</code>、<code>Interner</code>）で、同じ持ち主の同じ型の列だけが保存先を共有します。<code
			>String</code
		>
		のバッファは <code>take_string</code> と <code>give_string</code> で、<code>u8</code> の保存先を通します。
	</p>
</div>

<Code item={data.code.takeKeyed} />
<Code item={data.code.giveKeyed} />
<Code item={data.code.takeString} />

<div class="prose-learn">
	<p>
		一人の持ち主の中にも、同じ型の列が複数あることがあります。<code>SyntaxTree</code> では <code>extra</code> と、パーサの作業用スタック
		<code>scratch</code> がどちらも <code>Vec&lt;NodeIdentifier&gt;</code> です。保存先は後入れ先出しなので、借りた順の逆に返せば、次の文書でもそれぞれが自分の大きさのバッファを受け取ります。
	</p>
</div>

<Code item={data.code.syntaxTreeDrop} />
<Code item={data.code.keyedTest} />

<div class="prose-learn">
	<p>
		保存領域を持ち主ごとに分けました。構文木、整形用のデータ、コンポーネント、名前の保存表がそれぞれ別の領域を再利用します。
		1回の実行でメモリを確保する回数は2,667,581回から2,488,731回に減りました（−6.7%）。
		確保したバイト数は205,928,932から188,999,498に減りました。増えた計測値はありません（20f5846343）。
	</p>

	<H2 id="limits" />
	<p>
		プールが持つ量には二つの上限があります。一つの保存先に置けるのは <code>MAXIMUM_PER_KEY</code> 個までです。そして、スレッドのプール全体で持てるのは
		<code>MAXIMUM_BYTES</code>（64 MiB）までです。どちらかを超えるバッファは、保存先に置かずに普通に解放します。
	</p>
</div>

<Code item={data.code.perKey} />
<Code item={data.code.maxBytes} />
<Code item={data.code.giveAt} mark={['if p.bytes + layout.size() > MAXIMUM_BYTES {', 'let room = slot.len() < MAXIMUM_PER_KEY;']} />

<div class="prose-learn">
	<p>
		バイトの予算は後から足したものです。予算がないと、一度だけ現れた巨大な文書のバッファが、その後ずっとプールに残ります。一回で終わる コマンドラインの実行プログラム
		なら問題になりませんが、言語サーバーのように長く動くプロセスでは、ピークのメモリがいつまでも下がりません。
	</p>
	<p>
		この予算は、検証用のソースファイル集では一度も効きません。予算を入れても割り当ての計数は一つも動きませんでした。それでも予算が本当に経路の上にあることは、対照で確かめてあります。予算を
		64 KiB に縮めると、1 ラウンドの割り当ては 2,021,660 回から 2,547,339 回に増えます。代わりに、帳簿付けの費用が命令数で +0.22%（2,749,769,496 →
		2,755,832,077）かかり、そのすべてが <code>take</code> と <code>give</code> の中にあります。一つの構造の借り入れと返却を一度の借用にまとめる形も試しましたが
		+0.26% で取り戻せず、呼び出し一回ずつの 呼び出し方法 のままにしています（e8eef831d3）。
	</p>
</div>

<Code item={data.code.budgetTest} />

<div class="prose-learn">
	<p>
		<code>take</code> は、容量に関係なく最後に返されたベクタを渡します（後入れ先出し）。図で文書 3（ノード 300）の最初の
		<code>take</code> を見ると、直前の文書でパースに使った小さなベクタが渡され、そこから伸ばし直していることが分かります<Note
			>容量が大きいものから渡す、あるいは必要な大きさに近いものを選ぶ、といった工夫はしていません。どれが効くかは、測ってから決めることになります。</Note
		>。図の「予算」を押すと、予算を超えるバッファが解放され、次の文書がまた伸ばし直す様子が見えます。
	</p>
	<p>スレッドが終わるときは、プールに残ったベクタを <code>Layout</code> を使って解放します。</p>
</div>

<Code item={data.code.drop} />

<div class="prose-learn">
	<p>
		プールはスレッドローカルなので、ワーカーが同じであるあいだだけ効きます。rayon の既定のスレッドは実行をまたいで残ります。<code
			>RunOptions::threads</code
		>
		を指定した実行も、<code>in_pool</code> が最後に使ったスレッド数のプールを一つ、プロセスのあいだ残します。同じスレッド数で続けて実行すれば、同じスレッドと、そのスレッドが貯めた容量を使い回します（<a
			href="/learn/kernel/pipeline#run">06</a
		>）。
	</p>

	<H2 id="users" />
	<p>プールを使う主な構造は次のとおりです。</p>
	<ul>
		<li><code>rsvelte_typescript::SyntaxTree</code>:構文木の列、文字列、コメント、型の表、パーサの作業用スタック（<a href="/learn/polish#history">14</a>）。</li>
		<li><code>Tokens&lt;K&gt;</code>: トークン表（<a href="/learn/kernel/layers#tokens">05</a>）。鍵は要素の型 <code>Token&lt;K&gt;</code> だけです。</li>
		<li><code>rsvelte_svelte::syntax::syntax_tree::Component</code>: テンプレートの列。</li>
		<li><Term name="LayoutInstructions" />: 整形用のデータ構造 のアリーナ（<a href="/learn/kernel/document#ir">08</a>）と、プリンタのスタックや作業リスト。</li>
		<li><code>Interner</code>: 名前の文字列、終端、ハッシュ表（<a href="/learn/kernel/interning#growth">03</a>）。</li>
	</ul>
	<p>
		ほかに、文書ごとの計算結果の保存領域、行の索引、構造化データの書き手、Svelte のパーサ、スタイルシートの解析、型検査用の構文木もプールを使います。
	</p>
</div>

<Code item={data.code.tokensDefault} />
<Code item={data.code.componentDrop} />

<div class="prose-learn">
	<p>
		以前は、文書ごとに字句の保存領域を確保して捨てていました。容量はソースの長さの4分の1でした。構文解析処理の <code
			>svelte.parse</code
		>
		は 32 メガバイト のソースに対して 1 ラウンドで 253 メガバイト を確保していました。プールに入れた変更で、1 ラウンドの確保バイト数は 385,305,807 から 210,562,915（−45%）になりました（92571ee562）。
	</p>

	<H2 id="measure" />
	<p>
		<code>set_enabled(false)</code> にすると、<code>take</code> は常に空のベクタを返し、<code>give</code>
		は何もしません。この切り替えは、効果を測るためだけにあります。
	</p>
</div>

<Code item={data.code.setEnabled} />

<div class="prose-learn">
	<p>
		ベンチマークの <code>nopool</code> 比較対象がこれを使います。ビルド <code>{data.benchRev.slice(0, 10)}</code> で {data.docs.toLocaleString('en-US')}
		文書を処理したとき、プールを切ると中央値は {data.shared.plain[0].toFixed(1)} ms から {data.nopool.plain[0].toFixed(1)} ms に、割り当て回数は
		{(data.shared.allocations / 1e6).toFixed(2)}M 回から {(data.nopool.allocations / 1e6).toFixed(2)}M 回に増えました。プールがあることで、時間は約 {pct(
			data.shared.plain[0],
			data.nopool.plain[0]
		)}%、割り当ては約 {pct(data.shared.allocations, data.nopool.allocations)}% 減っています。
	</p>
	<DeepDive title="この比較が古い理由">
		<p>
			この比較は、鍵を持ち主ごとに分けたあとのビルド（d6f426e250）で測ったもので、今のコードより古い版です。それ以降の変更の効果は、上に書いたとおり性能の基準値との比較検査の計数（1
			スレッド、最後のラウンド）で測っていて、ベンチマークの実行時間とは別の量です（<a href="/learn/measure#ratchet">13</a>）。
		</p>
	</DeepDive>
</div>

<Code item={data.code.test} />

<ChapterFooter chapter={c} />
