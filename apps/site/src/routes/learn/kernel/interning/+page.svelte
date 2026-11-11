<script lang="ts">
	import ChapterFooter from '#lib/components/ChapterFooter.svelte';
	import ChapterHeader from '#lib/components/ChapterHeader.svelte';
	import Code from '#lib/components/Code.svelte';
	import H2 from '#lib/components/H2.svelte';
	import Note from '#lib/components/Note.svelte';
	import { chapter } from '#lib/site.ts';
	import InternerViz from '#lib/widgets/InternerViz.svelte';

	let { data } = $props();
	const c = chapter('intern');
</script>

<svelte:head><title>{c.title} — rsvelte 開発者向けの教材</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="識別子の名前を、Atom という小さな整数に置き換えます。比較とハッシュが整数一つで済み、名前ごとの文字列の割り当てもなくなります。"
/>

<div class="prose-learn">
	<H2 id="why" />
	<p>
		名前を <code>String</code>
		のまま一つずつ持つと、名前ごとに文字列を確保します。インターンすると、同じ名前は同じ
		<dfn>Atom</dfn>（中身は <code>u32</code>）になり、文字はすべて一本のバッファに並びます。Atom
		同士の比較は、整数の比較で済みます。
	</p>
	<p>
		名前を Atom に置き換える型が、カーネルの <code>Interner</code> です。カーネルは
		<code>Interner</code>
		を提供するだけで、使うのは言語の側です。今使うのは、CSS の構文木
		<code>rsvelte_stylesheet_syntax::StyleSheet</code> だけです。CSS の識別子や文字列は
		<code>\31 a</code> のようにエスケープを含むことがあります。エスケープを解いた文字列はソースのどこにもないので、<code
			>Interner</code
		>
		に保存します。構文木は、ソースの範囲ごとにその Atom を表に記録します。エスケープを含まない名前は、ソースの範囲からそのまま読みます<Note
			><code>Interner</code> は文書ごとに作ります。文書をまたいで Atom を比べることはありません。</Note
		>。
	</p>

	<H2 id="layout" />
	<p>
		<code>Interner</code> の中身は三つのベクタです。すべての名前の文字を一本の <code>buffer</code>
		につなげ、<code>ends</code>
		に各名前の終わりの位置を記録します。Atom <var>n</var> の文字列は、<code>ends[n-1]</code> から
		<code>ends[n]</code> までです。
	</p>
</div>

<Code item={data.code.interner} />
<Code item={data.code.get} />

<div class="prose-learn">
	<p>
		新しい名前を足しても、伸びるのは <code>buffer</code> と <code>ends</code>
		の末尾だけです。割り当てが起きるのは、容量が足りなくなったときだけです。容量は倍々に増えるので、割り当ては名前の数が倍になるたび、ベクタ一本あたり一回です。
	</p>

	<H2 id="table" />
	<p>
		名前から Atom を引くには、開番地法のハッシュテーブルを使います。<code>table</code>
		の各要素（スロット）には「Atom の番号 + 1」を入れ、0 を空の印にします。名前のハッシュ値を FxHash（<code
			>rustc-hash</code
		> の高速なハッシュ関数）で求め、その下位ビットでスロットを決めます。埋まっていれば隣のスロットへ進みます（線形プローブ）。
	</p>
</div>

<Code item={data.code.probe} mark={['_ => i = (i + 1) & mask']} />
<Code
	item={data.code.intern}
	mark={['Ok(atom) => return atom,', '(self.ends.len() + 1) * 2 > self.table.len()']}
/>

<InternerViz />

<div class="prose-learn">
	<p>
		探索は <code>probe</code> 一つにまとめてあります。見つかれば Atom
		を、なければ入れるべき空きスロットを返します。<code>lookup</code>
		は同じ探索を、挿入せずに使います。テーブルがまだなければ、探索せずに <code>None</code> を返します。
	</p>
</div>

<Code item={data.code.lookup} />

<div class="prose-learn">
	<H2 id="growth" />
	<p>
		名前の数が容量の半分を超えるときは、容量を倍にしてすべての名前を入れ直します。最初の容量は 64
		です。負荷率を 0.5 以下に保つので、線形プローブの列は短く済みます。図の「+20」を二回押すと、33
		個目の名前で容量が 128 に増えます。
	</p>
	<p>
		拡張するかどうかは、探索して名前がなかったとき（空きスロットに着いたとき）にだけ判定します。負荷率を上げるのは新しい名前だけなので、すでにある名前を引いても表は大きくなりません。拡張したときは、新しい表で空きスロットを探し直します。
	</p>
</div>

<Code item={data.code.grow} mark={['self.table.clear();', 'self.table.resize(cap, 0);']} />

<div class="prose-learn">
	<p>
		入れ直しても文字列は動きません。<code>buffer</code> と <code>ends</code>
		はそのままで、変わるのは <code>table</code> だけです。Atom の番号も変わらないので、配った Atom はそのまま使えます。表は新しいベクタを作らず、同じベクタを空にして必要な長さまで
		0 で埋めます。次の段落のとおり、このベクタは前の文書から容量を引き継ぐことがあり、そのときはここで割り当てが起きません。
	</p>
	<p>
		三つのベクタは、文書をまたいで使い回します。バッファプールは、使い終わったベクタをスレッドごとに預かり、次の文書に貸し出す仕組みです（<a
			href="/learn/kernel/buffer-pool#keyed">13 章</a
		>）。<code>Interner</code> は作るときに、<code>Interner</code>
		という鍵でバッファを借り、捨てるときに返します。返す順は借りた順の逆です。<code>ends</code> と
		<code>table</code>
		はどちらも
		<code>Vec&lt;u32&gt;</code> なので、逆の順で返すと、次の文書でもそれぞれが自分の容量のバッファを受け取れます。
	</p>
	<p>
		以前のプールは、バッファを要素の型だけで分けていました。そのため <code>Interner</code> の
		<code>buffer</code>（<code>u8</code>
		のバッファ）と整形器の出力バッファが同じ保存先に並び、互いの大きさまで伸ばし合っていました。どちらかをプールに入れる変更は、もう一方の計測値の悪化として現れました。持ち主ごとに鍵を分け、<code
			>Interner</code
		>
		のバッファも再利用するように変えました。ベンチマークの 1 ラウンドでメモリを確保する回数は、2,667,581
		回から 2,488,731 回に減りました（−6.7%）。命令数は 3,012,227,617 から 2,960,233,041 になりました（−1.7%）。1
		ラウンドは、全ファイルを一回処理する測定です（<a href="/learn/measure">14 章</a>）。
	</p>
</div>

<ChapterFooter chapter={c} />
