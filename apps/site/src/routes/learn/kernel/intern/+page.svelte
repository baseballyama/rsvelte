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
		カーネルは Interner を提供するだけで、使うのは言語の側です。今は <code>rsv_js</code> の <code>Ast</code>
		が一つずつ持ち、スコープ解析が <code>(ScopeId, Atom)</code> をキーに束縛を引きます<Note
			>Interner は文書ごとに作られます。文書をまたいで Atom を比べることはできませんし、その必要もありません。</Note
		>。
	</p>

	<H2 id="layout" />
	<p>
		Interner の中身は三つのベクタだけです。すべての名前の文字を一本の <code>buf</code> につなげ、<code>ends</code>
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
		名前から Atom を引くには、開番地法のハッシュテーブルを使います。<code>table</code> の各 slot には「Atom の番号 +
		1」を入れ、0 を空の印にします。ハッシュ値の下位ビットで slot を決め、埋まっていれば隣の slot へ進みます（線形プローブ）。
	</p>
</div>

<Code item={data.code.intern} mark={['(self.ends.len() + 1) * 2 > self.table.len()', '_ => i = (i + 1) & mask']} />

<InternerViz />

<div class="prose-learn">
	<p>
		<code>lookup</code> は同じ探索を、挿入せずに行います。テーブルがまだないときは、探索せずに <code>None</code> を返します。
	</p>
</div>

<Code item={data.code.lookup} />

<div class="prose-learn">
	<H2 id="growth" />
	<p>
		名前の数がテーブルの容量の半分を超えそうになると、容量を倍にして全員を入れ直します。最初の容量は 64 です。負荷率を 0.5
		以下に保つので、線形プローブの列は短く済みます。図の「+20」を二回押すと、33 個目の名前で容量が 128 に増えるのが見えます。</p>
	<p>
		拡張の判定は、名前を探すより前にあります。そのため、32 個入った状態で次に <code>intern</code>
		を呼ぶと、それがすでにある名前でも、表は拡張されます<Note
			>結果は正しいままです。表が一回早く大きくなるだけです。挿入のときだけ拡張したいなら、探索して空き slot に着いたところで判定する形になります。</Note
		>。
	</p>
</div>

<Code item={data.code.grow} />

<div class="prose-learn">
	<p>
		入れ直すときに文字列は動きません。<code>buf</code> と <code>ends</code> はそのままで、変わるのは <code>table</code>
		だけです。Atom の番号も変わらないので、すでに配られた Atom はそのまま使えます。
	</p>
</div>

<ChapterFooter chapter={c} />
