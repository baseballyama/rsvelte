<script lang="ts">
	import Term from '#lib/components/Term.svelte';
	import ChapterFooter from '#lib/components/ChapterFooter.svelte';
	import ChapterHeader from '#lib/components/ChapterHeader.svelte';
	import Code from '#lib/components/Code.svelte';
	import DeepDive from '#lib/components/DeepDive.svelte';
	import H2 from '#lib/components/H2.svelte';
	import Note from '#lib/components/Note.svelte';
	import { chapter } from '#lib/site.ts';
	import PoolViz from '#lib/widgets/PoolViz.svelte';

	let { data } = $props();
	const c = chapter('pool');
	const pct = (a: number, b: number) => ((1 - a / b) * 100).toFixed(0);
</script>

<svelte:head><title>{c.title} — rsvelte 開発者向けの教材</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="ワーカー（文書を処理するスレッド）は、文書を次々に処理します。前の文書が使い終えたベクタを次の文書が受け取れば、ベクタを伸ばす確保はほとんど要りません。"
/>

<div class="prose-learn">
	<H2 id="idea" />
	<p>
		<code>rsvelte_typescript</code> の構文木 <code>SyntaxTree</code>
		は、ノードの種類、フラグ、データ、位置などを列ごとのベクタに持ちます。文書を一つパースすると、各ベクタはノードの数まで伸び、伸びるたびに確保し直します。文書が終わると木は捨てられ、次の文書でまた
		0 から伸ばします。
	</p>
	<p>
		<code>pool</code>
		は、捨てる木のベクタを空にしてスレッドローカルに取っておき、次に作る木に渡します。このページでは、ベクタが要素を置くメモリをバッファと呼びます。木は作るときにバッファを借り（<code
			>take</code
		>）、<code>Drop</code> で返します（<code>give</code>）。
	</p>

	<H2 id="take-give" />
</div>

<Code item={data.code.take} />
<Code item={data.code.give} />

<div class="prose-learn">
	<p>
		どちらも中身は <code>take_at</code> と <code>give_at</code>
		の呼び出しで、違うのは保存先を選ぶ鍵だけです。鍵の型 <code>TypeIdentifier</code>
		は、標準ライブラリの
		<code>TypeId</code>
		を別名で読み込んだものです。プールは、鍵ごとに、生のポインタ・容量・<code>Layout</code>
		の組の列を持ちます。全体で持っているバイト数も数えます。
	</p>
</div>

<Code item={data.code.pool} />
<Code item={data.code.takeAt} />

<div class="prose-learn">
	<p>
		<code>take_at</code> は、バッファを <code>Vec::from_raw_parts</code> で長さ 0 のベクタに組み立て直します。長さ
		0 のベクタは中身を読まないので、型さえ合えば安全です。
	</p>
	<p>
		型が合うことは鍵が保証します。鍵は、<code>T</code> を包んだ印の型 <code>Plain&lt;T&gt;</code>
		か、<code>K</code> と <code>T</code> を包んだ <code>Keyed&lt;K, T&gt;</code>
		の <code>TypeIdentifier</code> です。どちらの鍵の下にも、<code>Vec&lt;T&gt;</code>
		から来たバッファしか入りません。
	</p>
</div>

<PoolViz />

<div class="prose-learn">
	<H2 id="keyed" />
	<p>
		以前のプールは、要素の型だけを鍵にしていました。そのため、同じ要素型の列を持つ別々の構造が、同じ保存先のバッファを取り合いました。たとえば、文書の名前を貯める
		<code>Interner</code> の <code>buffer</code> と整形器の出力バッファは、どちらも
		<code>u8</code> のバッファです。
	</p>
	<p>
		片方が大きなバッファを返すと、もう片方が次の文書でそれを受け取り、さらに伸ばして返します。互いに相手の大きさまで伸ばし合うので、どちらかをプールに入れると、もう一方の計測値が悪化しました。
	</p>
	<p>
		そこで、持ち主の型も鍵に含める <code>take_keyed::&lt;K, T&gt;</code> と <code>give_keyed</code>
		を足しました。<code>K</code>
		は構造体そのもの（<code>SyntaxTree</code>、<Term name="LayoutInstructions" />、<code
			>Component</code
		>、<code>Interner</code>）です。同じ持ち主の同じ型の列だけが、保存先を共有します。<code
			>String</code
		>
		のバッファは、<code>take_string</code> と <code>give_string</code> で <code>u8</code>
		の保存先を通ります。
	</p>
</div>

<Code item={data.code.takeKeyed} />
<Code item={data.code.giveKeyed} />
<Code item={data.code.takeString} />

<div class="prose-learn">
	<p>
		一つの持ち主が、同じ型の列を複数持つこともあります。<code>SyntaxTree</code>
		では、<code>extra</code> とパーサの作業用スタック <code>scratch</code> が、どちらも
		<code>Vec&lt;NodeIdentifier&gt;</code>
		です。保存先は後入れ先出しなので、借りた順の逆に返せば、次の文書でもそれぞれが自分の大きさのバッファを受け取ります。
	</p>
</div>

<Code item={data.code.syntaxTreeDrop} />
<Code item={data.code.keyedTest} />

<div class="prose-learn">
	<p>
		鍵を持ち主ごとに分けたのは、コミット <code>20f5846343</code> の変更です。この変更で、<code
			>SyntaxTree</code
		>、<code>LayoutInstructions</code>、<code>Component</code>、<code>Interner</code>
		が、それぞれ自分の保存先を使うようになりました。
	</p>
	<p>
		1 ラウンドは、全ファイルを一通り処理する 1 回です（<a href="/learn/measure#counters">14 章</a
		>）。1 ラウンドの割り当て回数は、2,667,581 回から 2,488,731
		回に減りました（−6.7%）。確保したバイト数は 205,928,932 から 188,999,498
		に減り、増えた計測値はありませんでした。
	</p>

	<H2 id="limits" />
	<p>
		プールが持てる量には二つの上限があります。一つの保存先に置けるのは <code>MAXIMUM_PER_KEY</code>
		個までです。スレッドのプール全体で持てるのは <code>MAXIMUM_BYTES</code>（64
		MiB）までです。どちらかを超えるバッファは、保存先に入れず、そのまま解放します。
	</p>
</div>

<Code item={data.code.perKey} />
<Code item={data.code.maxBytes} />
<Code
	item={data.code.giveAt}
	mark={[
		'if p.bytes + layout.size() > MAXIMUM_BYTES {',
		'let room = slot.len() < MAXIMUM_PER_KEY;',
	]}
/>

<div class="prose-learn">
	<p>
		バイトの予算は、鍵を分けた後に足しました（コミット <code>e8eef831d3</code
		>）。予算がないと、一度だけ現れた巨大な文書のバッファが、その後ずっとプールに残ります。一回で終わるコマンドラインの実行なら困りません。ただ、言語サーバーのように長く動くプロセスでは、メモリのピークがいつまでも下がりません。
	</p>
	<p>
		検証用のソースファイル集（公式ツールの出力と比べる、実在する Svelte
		ファイルの集まり）では、この予算は一度も効きません。予算を入れても、割り当ての数は一つも動きませんでした。
	</p>
	<p>
		予算の判定が実際に働くことは、対照実験で確かめました。予算を 64 KiB まで縮めると、1
		ラウンドの割り当ては 2,021,660 回から 2,547,339
		回に増えます。この数は予算を足した時点のビルドで測ったもので、上の 2,488,731
		回の後にほかの変更も入っています。
	</p>
	<p>
		ただし、プールが持つバイト数を数える処理の分だけ、命令数が +0.22%（2,749,769,496 →
		2,755,832,077）増えます。その全部が <code>take</code> と <code>give</code>
		の中です。一つの構造の借り入れと返却を一度の借用にまとめる形も試しましたが、増加は +0.26% で、今の形より悪くなりました。そのため、呼び出し一回ごとの形のままです。
	</p>
</div>

<Code item={data.code.budgetTest} />

<div class="prose-learn">
	<p>
		<code>take</code>
		は、容量に関係なく、最後に返されたベクタを渡します（後入れ先出し）。図で文書 3（ノード 300）の最初の
		<code>take</code>
		を見ると、直前の文書がパースに使った小さなベクタを受け取り、そこから伸ばし直しています<Note
			>容量の大きいものから渡す、必要な大きさに近いものを選ぶ、といった工夫はしていません。試すなら、効果を測ってから入れます。</Note
		>。予算を超えるバッファは解放され、次の文書はまた伸ばし直します。図の「予算」を押すと、その様子が見えます。
	</p>
	<p>スレッドが終わるときは、プールに残ったベクタを <code>Layout</code> を使って解放します。</p>
</div>

<Code item={data.code.drop} />

<div class="prose-learn">
	<p>
		プールはスレッドローカルなので、同じワーカーが続けて処理するあいだだけ効きます。Rust
		の並列処理ライブラリ rayon の既定のスレッドは、実行をまたいで残ります。
	</p>
	<p>
		<code>RunOptions::threads</code>
		でスレッド数を指定した実行は、関数 <code>in_pool</code>
		がスレッドプールを選びます。<code>in_pool</code>
		は、最後に使ったスレッド数のスレッドプールを一つ、プロセスが終わるまで残します。1 を指定したときは、呼び出したスレッドで実行します。同じスレッド数で続けて実行すれば、同じスレッドと、そのスレッドが貯めたバッファを使い回します（<a
			href="/learn/kernel/pipeline#run">06 章</a
		>）。
	</p>

	<H2 id="users" />
	<p>プールを使う主な構造は次のとおりです。</p>
	<ul>
		<li>
			<code>rsvelte_typescript::SyntaxTree</code
			>：構文木の列、文字列、コメント、型の表、パーサの作業用スタック（<a
				href="/learn/polish#history">15 章</a
			>）。
		</li>
		<li>
			<code>Tokens&lt;K&gt;</code>：トークン表（<a href="/learn/kernel/layers#tokens">05 章</a
			>）。鍵は要素の型 <code>Token&lt;K&gt;</code> だけです。<code>Token&lt;K&gt;</code>
			のベクタを持つのはトークン表だけなので、取り合いは起きません。
		</li>
		<li><code>rsvelte_svelte::syntax::syntax_tree::Component</code>：テンプレートの列。</li>
		<li>
			<code>LayoutInstructions</code>：アリーナ（<a href="/learn/document-printer#ir">09 章</a
			>）と、プリンタのスタックや作業リスト。
		</li>
		<li>
			<code>Interner</code>：名前の文字列、終端、ハッシュ表（<a
				href="/learn/kernel/interning#growth">03 章</a
			>）。
		</li>
	</ul>
	<p>
		ほかに、文書ごとの計算結果の保存領域、行の索引、構造化データの書き手、Svelte
		のパーサ、スタイルシートの解析、型検査用の構文木もプールを使います。
	</p>
</div>

<Code item={data.code.tokensDefault} />
<Code item={data.code.componentDrop} />

<div class="prose-learn">
	<p>
		以前は、文書ごとにトークン表を確保して捨てていました。容量はソースの長さの 4 分の 1
		です。トークン表と <code>Component</code>
		の列をプールに入れたのは、コミット <code>92571ee562</code> の変更です。その前は、構文解析の処理
		<code>svelte.parse</code> だけで、1 ラウンドに 253 メガバイトを確保していました。ソースは合計 32 メガバイトです。
	</p>
	<p>
		この変更で、1 ラウンド全体（すべての処理の合計）の確保バイト数は 385,305,807 から 210,562,915
		に減りました（−45%）。鍵を持ち主ごとに分ける前のビルドで測った数です。
	</p>

	<H2 id="measure" />
	<p>
		<code>set_enabled(false)</code> にすると、<code>take</code> は常に空のベクタを返し、<code
			>give</code
		>
		は何もしません。この切り替えは、効果を測るためだけにあります。
	</p>
</div>

<Code item={data.code.setEnabled} />

<div class="prose-learn">
	<p>
		ベンチマークの測定条件 <code>nopool</code>
		がこれを使います。測定条件は rsvelte 自身の設定の違いで、ほかのツールとの比較ではありません。ビルド
		{data.benchRev.slice(0, 10)} で {data.docs.toLocaleString('en-US')}
		文書を処理しました。プールを切ると、中央値が {data.shared.plain[0].toFixed(1)} ms から {data.nopool.plain[0].toFixed(
			1,
		)} ms に増えました。割り当て回数も
		{(data.shared.allocations / 1e6).toFixed(2)}M 回から {(data.nopool.allocations / 1e6).toFixed(
			2,
		)}M 回に増えました。プールがあると、時間は約 {pct(
			data.shared.plain[0],
			data.nopool.plain[0],
		)}%、割り当ても約 {pct(data.shared.allocations, data.nopool.allocations)}% 少なくなります。
	</p>
	<DeepDive title="この比較が古い理由">
		<p>
			上のビルドは鍵を持ち主ごとに分けた後のもので、今のコードより古い版です。それ以降の変更の効果は、性能の基準値との比較検査（割り当て回数や命令数を基準値と比べる検査）の数で測っています。数えるのは
			1 スレッドで最後のラウンドです。ベンチマークの実行時間とは別の量です（<a
				href="/learn/measure#ratchet">14 章</a
			>）。
		</p>
	</DeepDive>
</div>

<Code item={data.code.test} />

<ChapterFooter chapter={c} />
