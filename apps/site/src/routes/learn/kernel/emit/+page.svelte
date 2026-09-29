<script lang="ts">
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import EmitCompare from '$lib/widgets/EmitCompare.svelte';
	import SpanFigure from '$lib/widgets/SpanFigure.svelte';
	import VlqEncoder from '$lib/widgets/VlqEncoder.svelte';

	let { data } = $props();
	const c = chapter('emit');
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="コンパイラは JavaScript を、型検査は TypeScript を生成します。生成したものに見つかった問題を元のコンポーネントの位置で報告するには、生成した文字がどこから来たかを覚えておく必要があります。Emitter は出力の文字列と、その対応表を一緒に作ります。"
/>

<div class="prose-learn">
	<H2 id="emitter" />
	<p>Emitter は出力の文字列と、<dfn>Mapping</dfn> のリストだけを持ちます。</p>
</div>

<Code item={data.code.emitter} />
<Code item={data.code.mapping} />

<div class="prose-learn">
	<p>Mapping には二種類あります。</p>
	<ul>
		<li>
			<strong>コピー</strong>（<code>len &gt; 0</code>）: 元のテキストの <code>len</code>
			バイトをそのまま写した区間です。内側の位置は 1 対 1 に対応します。<code>copy</code> が作ります。
		</li>
		<li>
			<strong>点</strong>（<code>len == 0</code>）: 生成側のこの位置が元のこの位置に当たる、という印です。<code>mark</code> と
			<code>push_for</code> が作ります。改名した識別子や、コンパイラが足した呼び出しに使います。
		</li>
	</ul>
</div>

<Code item={data.code.copy} />
<Code item={data.code.mark} />
<Code item={data.code.pushFor} />

<div class="prose-learn">
	<p>
		<code>push_for</code> は <code>Loc</code> を受け取り、合成されたノードなら印を付けません（<a href="/learn/kernel/source#loc">02</a
		>）。偽の位置を写像に混ぜないための仕組みです。
	</p>
	<p>次の図は、rsvelte のコンパイラが実際に出力した JavaScript と、その写像です。トップページの図と同じものです。</p>
</div>

<SpanFigure data={data.counter} label="図 9.0 · Counter.svelte の出力（本物）" />

<div class="prose-learn">
	<p>
		写像はまだ {data.counter.mappings.length} 個しかなく、すべて点です<Note
			>出力と写像は <code>crates/rsv_svelte/examples/emit_mappings.rs</code> で生成し、サイトのデータとしてコミットしています。コンパイルタスク自体は、今は写像をファイルに書き出していません。</Note
		>。同じ入力を上流の Svelte 5.57.1 でコンパイルすると、source map のセグメントは 28 個になります<Note><code>compile(src, &#123; filename: 'Counter.svelte', generate: 'client' &#125;)</code> の <code>js.map.mappings</code> のセグメントを数えました。rsvelte の <code>source_map</code> はコピーの文字ごとと点ごとにセグメントを書きますが、この出力にはコピーがなく点が 6 個なので、6 個です。</Note>。写像のない文字は、同じ行の直前の写像点に引き寄せられます。
	</p>

	<H2 id="lookup" />
	<p>
		逆引き（生成側の位置から元の位置へ）は <code>lookup</code> です。規則は、文字単位の source map を読むときと同じ<dfn>最大下界</dfn>（greatest
		lower bound）です。つまり、同じ生成行で、その位置以前にある最後の写像点を探します。
	</p>
</div>

<Code item={data.code.lookup} mark={['(!between.contains(']} />

<div class="prose-learn">
	<p>
		見つけた Mapping がコピーで、位置がその内側なら 1 対 1 に写します。コピーの外（挿入されたテキストの中）なら、コピーの最後の文字の先頭を返します。点の
		Mapping なら、その点を返します。どちらの場合も、その点と位置のあいだに改行があれば <code>None</code> です。source map
		の読み手は行をまたいで探さないので、ここも同じにしています。
	</p>

	<H2 id="lookup-span" />
	<p>
		診断は範囲を持つので、両端を <code>lookup</code> で写します。
	</p>
</div>

<Code item={data.code.lookupSpan} />

<div class="prose-learn">
	<p>
		ここに小さな罠があります。終端は半開区間の「次の位置」なので、コピーの直後にあることが多く、そこは挿入されたテキストです。<code>lookup</code>
		はそこを「最後にコピーした文字の位置」に写すので、元の範囲より 1 文字短くなります。
	</p>
	<p>
		これは svelte-check の振る舞いと同じなので、あえて直していません。svelte-check も、終端を「生成側の終端位置にある文字の元の位置」に写します。一致させたいのは上流の出力なので、終端をきっちり合わせたいときは、生成する側がコピーの直後に
		<code>mark</code> を置きます。テストがその両方を確かめています。
	</p>
</div>

<Code item={data.code.spansTest} mark={['Some(Span::new(3, 12))', 'marked.mark(16);', 'Some(Span::new(15, 16))']} />

<div class="prose-learn">
	<p>
		型検査は、tsc が報告した位置をこの関数で元のコンポーネントに戻しています。両端のどちらかが写らない診断（生成したコードの中で起きたもの）は捨てます。svelte-check
		も、写した範囲の行が負になった診断を捨てています（<code>hasNoNegativeLines</code>）。
	</p>
</div>

<Code item={data.code.checkFinish} mark={['lookup_span(d.span)']} />

<div class="prose-learn">
	<H2 id="source-map" />
	<p>
		<code>source_map</code> は写像を source map v3 の JSON にします。まず Mapping を写像点に展開します。コピーは文字ごとに一点、点の Mapping
		は一点で、同じ生成位置に二つあれば後のものが勝ちます（<code>lookup</code> と同じ）。それを生成位置の順に、行ごとに
		<code>;</code> で区切り、各点を「生成列、ソース番号、元の行、元の列」の差分の四つ組として書きます。
	</p>
</div>

<Code item={data.code.points} />
<Code item={data.code.sourceMap} />

<div class="prose-learn">
	<p>
		差分の数は <dfn>VLQ</dfn>（base64 の可変長整数）で書きます。符号を最下位ビットに移し、5 ビットずつ下から取り出して、続きがあれば 6 ビット目を立てます。
	</p>
</div>

<VlqEncoder />
<Code item={data.code.vlq} />

<div class="prose-learn">
	<H2 id="disagreement" />
	<p>
		カーネルの中の診断は <code>lookup</code> で写し、外部の道具（デバッガ、ブラウザ、ほかの言語ツール）は書き出した source map
		を読みます。二つの答えが同じでなければ、同じ Emitter について二つの真実ができてしまいます。
	</p>
	<p>
		source map の形式では、1 対 1 の区間を一つのセグメントで表せません。そのため、コピーの内側を正しく伝えるには文字ごとにセグメントを書く必要があります。magic-string
		の <code>hires: true</code> が文字ごとに書くのも、同じ理由です。図の「Mapping ごと」に切り替えると、一つしか書かなかった場合にコピーの内側がどう写るかが見えます。
	</p>
</div>

<EmitCompare />

<div class="prose-learn">
	<p>
		<code>lookup</code> の側を source map の粗さに合わせる手もありますが、それでは型検査の位置が svelte-check
		とずれます。そこで書き出しの側を細かくし、テストで source map を実際に復号して、出力のすべての位置で二つの答えが一致することを確かめています。
	</p>

	<H2 id="edits" />
	<p>
		タスクによっては、全体を印字し直すのではなく、元のテキストに小さな編集を加えるほうが素直です。<dfn>Edits</dfn>
		は挿入と置換を集め、一回の走査で適用します。
	</p>
</div>

<Code item={data.code.edits} />
<Code item={data.code.applyIn} mark={['assert!(lo as usize >= pos', 'assert!(range.lo <= lo']} />

<div class="prose-learn">
	<p>
		編集が重なっていないことと範囲の外にないことは、release ビルドでも確かめます。確かめなければ、重なった編集はずっと先のスライス（<code>&amp;src[pos..lo]</code>）で、原因と離れた場所の
		panic として表に出ます。コストは編集一つにつき比較二回です。
	</p>
</div>

<ChapterFooter chapter={c} />
