<script lang="ts">
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import InternerViz from '$lib/widgets/InternerViz.svelte';

	let { data } = $props();
	const c = chapter('intern');
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="識別子の名前を小さな整数 Atom に置き換えます。比較とハッシュが整数一つで済むようになり、名前ごとの文字列の割り当てもなくなります。"
/>

<div class="prose-learn">
	<H2 id="why" />
	<p>
		スコープ解析は「この名前はどの宣言を指すか」を何度も尋ねます。名前を <code>String</code>
		のまま持つと、比較のたびに文字列を比べ、ノードごとに文字列を確保することになります。インターンすると、同じ名前は同じ <dfn>Atom</dfn>（中身は
		<code>u32</code>）になるので、比較は整数の比較になります。
	</p>
	<p>
		カーネルは Interner を提供するだけで、使うのは言語の側です。今は <code>rsvelte_typescript</code> と <code>rsvelte_stylesheet</code> の <code>SyntaxTree</code>
		がそれぞれ一つずつ持ちます。スコープ解析が <code>(ScopeIdentifier, Atom)</code> をキーに束縛を引きます<Note
			>Interner は文書ごとに作られます。文書をまたいで Atom を比べることはできませんし、その必要もありません。</Note
		>。
	</p>

	<H2 id="layout" />
	<p>
		Interner の中身は三つのベクタだけです。すべての名前の文字を一本の <code>buffer</code> につなげ、<code>ends</code>
		に各名前の終わりの位置を記録します。Atom <var>n</var> の文字列は、<code>ends[n-1]</code> から <code>ends[n]</code> までです。
	</p>
</div>

<Code item={data.code.interner} />
<Code item={data.code.get} />

<div class="prose-learn">
	<p>
		新しい名前を足しても、増えるのは二つのベクタの末尾だけです。どちらも容量を倍々に増やすので、名前一つあたりの割り当ては償却すれば定数回で、名前ごとに
		<code>String</code> を作ることはありません。
	</p>

	<H2 id="table" />
	<p>
		名前から Atom を引くには、開番地法のハッシュテーブルを使います。<code>table</code> の各 配列の位置には「Atom の番号 +
		1」を入れ、0 を空の印にします。ハッシュ値の下位ビットで 配列の位置を決め、埋まっていれば隣の 配列の位置へ進みます（線形プローブ）。
	</p>
</div>

<Code item={data.code.probe} mark={['_ => i = (i + 1) & mask']} />
<Code item={data.code.intern} mark={['Ok(atom) => return atom,', '(self.ends.len() + 1) * 2 > self.table.len()']} />

<InternerViz />

<div class="prose-learn">
	<p>
		探索は <code>probe</code> 一つにまとめてあり、見つかれば Atom を、なければ入れるべき空き 配列の位置を返します。<code>lookup</code>
		は同じ探索を挿入せずに使います。テーブルがまだないときは、探索せずに <code>None</code> を返します。
	</p>
</div>

<Code item={data.code.lookup} />

<div class="prose-learn">
	<H2 id="growth" />
	<p>
		名前の数がテーブルの容量の半分を超えそうになると、容量を倍にして全員を入れ直します。最初の容量は 64 です。負荷率を 0.5
		以下に保つので、線形プローブの列は短く済みます。図の「+20」を二回押すと、33 個目の名前で容量が 128 に増えるのが見えます。</p>
	<p>
		拡張の判定は、探索して名前がなかったとき（空き 配列の位置に着いたとき）にだけ行います。負荷率を上げるのは新しい名前だけなので、すでにある名前を引いても表は大きくなりません。拡張したときは、新しい表でもう一度空き
		配列の位置を探します。
	</p>
</div>

<Code item={data.code.grow} mark={['self.table.clear();', 'self.table.resize(cap, 0);']} />

<div class="prose-learn">
	<p>
		入れ直すときに文字列は動きません。<code>buffer</code> と <code>ends</code> はそのままで、変わるのは <code>table</code>
		だけです。Atom の番号も変わらないので、すでに配られた Atom はそのまま使えます。表は新しいベクタを作らず、同じベクタを空にしてから必要な長さまで
		0 で埋めます。容量が足りていれば、ここで割り当ては起きません。
	</p>
	<p>
		三つのベクタは、文書をまたいでも使い回します。Interner は作るときにスレッドのバッファプールから <code>Interner</code>
		という鍵でバッファを借り、捨てるときに返します（<a href="/learn/kernel/buffer-pool#keyed">12</a>）。返す順は借りた順の逆です。<code>ends</code> と
		<code>table</code> はどちらも <code>Vec&lt;u32&gt;</code> なので、逆の順で返さないと、次の文書で互いのバッファを受け取ってしまいます。
	</p>
</div>

<Code item={data.code.pooled} />
<Code item={data.code.drop} />

<div class="prose-learn">
	<p>
		以前のプールはバッファを要素の型だけで分けていたので、Interner の <code>buffer</code>（<code>u8</code> のバッファ）と整形器の出力バッファが同じ保存先に並び、互いの大きさまで伸ばし合っていました。どちらかをプールに入れると、もう一方の性能や結果を悪化させる変更として現れていたのはこのためです。持ち主ごとに鍵を分け、Interner
		のバッファも再利用するように変えました。1回の実行でメモリを確保する回数は2,667,581回から2,488,731回に減りました（−6.7%）。
		命令数は3,012,227,617から2,960,233,041になりました（−1.7%、20f5846343）。
	</p>
</div>

<ChapterFooter chapter={c} />
