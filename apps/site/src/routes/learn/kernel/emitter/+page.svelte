<script lang="ts">
	import ChapterFooter from '#lib/components/ChapterFooter.svelte';
	import ChapterHeader from '#lib/components/ChapterHeader.svelte';
	import Code from '#lib/components/Code.svelte';
	import H2 from '#lib/components/H2.svelte';
	import Note from '#lib/components/Note.svelte';
	import { chapter } from '#lib/site.ts';
	import EmitCompare from '#lib/widgets/EmitCompare.svelte';
	import SpanFigure from '#lib/widgets/SpanFigure.svelte';
	import VlqEncoder from '#lib/widgets/VlqEncoder.svelte';

	let { data } = $props();
	const c = chapter('emit');
</script>

<svelte:head><title>{c.title} — rsvelte 開発者向けの教材</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="コードを生成すると、出力上の位置と元のソース上の位置がずれます。出力で見つかった問題を元のソースの位置で報告するために、Emitter は出力の文字列と位置の対応表を一緒に作ります。出力先の言語によらず使える部品です。"
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
			<dfn>コピー</dfn>（<code>len &gt; 0</code>）：元のテキストの <code>len</code>
			バイトをそのまま写した区間です。内側の位置は 1 対 1 に対応します。<code>copy</code> が作ります。
		</li>
		<li>
			<dfn>点</dfn>（<code>len == 0</code
			>）：生成側のこの位置が元のこの位置に当たる、という印です。<code>mark</code>
			が作ります。改名した識別子や、コンパイラが足した呼び出しに使います。
		</li>
	</ul>
</div>

<Code item={data.code.copy} />
<Code item={data.code.mark} />

<div class="prose-learn">
	<p>次の図は、Svelte プラグインが実際に出力した JavaScript と、その位置の対応です。</p>
</div>

<SpanFigure data={data.counter} label="図 10.0 · Counter.svelte の出力（本物）" />

<div class="prose-learn">
	<p>
		位置の対応はまだ {data.counter.mappings.length} 個しかなく、すべて点です<Note
			>図のデータは、ビルドのたびに <code
				>crates/languages/svelte/site/src/bin/export_site_source_maps.rs</code
			>
			で作ります。コンパイルタスク自体は、今は位置の対応をファイルに書き出しません。</Note
		>。同じ入力を公式の Svelte コンパイラ 5.57.3 でコンパイルすると、source map
		のセグメント（位置の対応を表す項目）は 24 個になります<Note
			>rsvelte の <code>source_map</code>
			はコピーの文字ごとと点ごとにセグメントを書くので、点だけのこの出力ではセグメントの数は点の数と同じです。</Note
		>。対応のない文字は、次の節の規則で、同じ行のその位置以前で最も近い対応点に写ります。
	</p>

	<H2 id="lookup" />
	<p>
		逆引き（生成側の位置から元の位置へ）は <code>lookup</code> です。規則は、文字単位の source map
		を読むときと同じで、<dfn>指定位置以前で最も近い対応点</dfn>（greatest lower
		bound）です。同じ生成行で、その位置以前にある最後の対応点を探します。
	</p>
</div>

<Code item={data.code.lookup} mark={['(!between.contains(']} />

<div class="prose-learn">
	<p>
		見つけた Mapping がコピーで、位置がその内側なら 1 対 1
		に写します。コピーの外（挿入されたテキストの中）なら、元のソースでの、コピーの最後の文字の開始位置を返します。点の
		Mapping なら、その点を返します。どちらの場合も、その点と位置のあいだに改行があれば <code
			>None</code
		> です。source map の読み手は行をまたいで探さないので、それに合わせています。
	</p>

	<H2 id="lookup-span" />
	<p>
		診断は範囲を持つので、両端を <code>lookup</code> で写します。
	</p>
</div>

<Code item={data.code.lookupSpan} />

<div class="prose-learn">
	<p>
		範囲の終端は半開区間の「次の位置」なので、コピーの直後、つまり挿入されたテキストにあることが多いです。<code
			>lookup</code
		>
		はそこを「最後にコピーした文字の位置」に写すので、元の範囲より 1 文字短くなります。
	</p>
	<p>
		svelte-check も、source map
		で写すときは終端を「生成側の終端位置にある文字の元の位置」に写します。同じ答えにするため、この振る舞いは直していません。終端を正確に合わせたいときは、生成する側がコピーの直後に
		<code>mark</code> を置きます。テストがその両方を確かめています。
	</p>
</div>

<Code
	item={data.code.spansTest}
	mark={['Some(Span::new(3, 12))', 'marked.mark(16);', 'Some(Span::new(15, 16))']}
/>

<div class="prose-learn">
	<p>
		Vue の公式の型検査（vue-tsc。中で Volar
		を使います）は、別の写し方をします。範囲の両端を別々に写さず、範囲の内側にあるコピーされた文字だけを集めて、その元の範囲を答えます。挿入したテキストは何にも写りません。生成側で
		<code>__VLS_context.x</code> と書かれた範囲の診断は、元の <code>x</code>
		だけに写ります。カーネルはこの規則も <code>lookup_overlap</code>
		として持っています。
	</p>
</div>

<Code item={data.code.lookupOverlap} />

<div class="prose-learn">
	<p>
		型検査のタスクは、どちらの規則を使うかを知りません。言語は、型検査用の TypeScript
		コードと一緒に写し方の関数を渡します（<a href="/learn/kernel/database#facet"
			>04 章「共通の呼び出し窓口」</a
		>）。Vue は <code>lookup_overlap</code> を、Svelte は <code>lookup_span</code>
		を渡します。ただし Svelte は content mapper を使うので、この関数は呼ばれません。content mapper は、コピーの対応を
		tsc に渡して、tsc に元のファイルの位置で報告させる外部プログラムです。写し方の関数は必須の欄なので、Svelte
		も渡しています。
	</p>
</div>

<Code item={data.code.mapBack} />

<div class="prose-learn">
	<p>
		content mapper を使わない言語では、tsc
		が報告した位置をこの関数で元のソースに戻します。写らない診断（生成したコードの中で起きたもの）は捨てます。svelte-check
		も、写した範囲の行が負になった診断を捨てています（<code>hasNoNegativeLines</code>）。
	</p>
</div>

<Code item={data.code.writeFindings} mark={['(d.map_back)(&d.projection, span)']} />

<div class="prose-learn">
	<H2 id="source-map" />
	<p>
		<code>source_map</code> は、位置の対応を source map v3 の JSON にします。まず Mapping
		を対応点に展開します。コピーは文字ごとに 1 点、点の Mapping は 1
		点です。同じ生成位置に二つあれば、後のものが勝ちます（<code>lookup</code>
		と同じ）。それを生成位置の順に並べ、行ごとに <code>;</code>
		で区切ります。各点は「生成列、ソース番号、元の行、元の列」の差分の四つ組として書きます。
	</p>
</div>

<Code item={data.code.points} />
<Code item={data.code.sourceMap} />

<div class="prose-learn">
	<p>
		差分の数は、base64 で書く<dfn>可変長の整数表現</dfn>にします。符号を最下位ビットに移し、5
		ビットずつ下から取り出して、続きがあれば 6 ビット目を立てます。
	</p>
</div>

<VlqEncoder />
<Code item={data.code.vlq} />

<div class="prose-learn">
	<H2 id="disagreement" />
	<p>
		カーネルの中の診断は <code>lookup</code> で写します。外部の道具（デバッガ、ブラウザ、ほかの言語ツール）は、書き出した
		source map を読みます。二つの答えは一致しなければなりません。
	</p>
	<p>
		source map の形式では、1 対 1
		の区間を一つのセグメントで表せません。コピーの内側を正しく伝えるには、文字ごとにセグメントを書く必要があります。magic-string
		の <code>hires: true</code> が文字ごとに書くのも同じ理由です。図で「Mapping ごと」に切り替えると、一つしか書かなかった場合にコピーの内側がどう写るかが見えます。
	</p>
</div>

<EmitCompare />

<div class="prose-learn">
	<p>
		<code>lookup</code> を source map の粗さに合わせる手もありますが、それではコピーの内側がすべてコピーの先頭に写ってしまいます。そこで書き出しの側を細かくしました。テストで
		source map を実際に復号し、出力のすべての位置で二つの答えが一致することを確かめています。
	</p>

	<H2 id="edits" />
	<p>
		タスクによっては、全体を出力し直すより、元のテキストに小さな編集を加えるほうが素直です。<dfn
			>Edits</dfn
		>
		は挿入と置換を集め、一回の走査で適用します。
	</p>
</div>

<Code item={data.code.edits} />
<Code
	item={data.code.applyIn}
	mark={['range.start_offset <= *start_offset', '*start_offset >= checked_to']}
/>

<div class="prose-learn">
	<p>
		編集が重なっていないことと、範囲の外にないことは、release
		ビルドでも確かめます。確かめないと、重なった編集は、原因から離れたスライス（<code
			>&source_text[position..start_offset]</code
		>）で panic します。コストは編集一つにつき確認二つ（比較は四回）です。
	</p>
	<p>
		二つの確認の順序にも意味があります。範囲を先に確かめるので、範囲より前にある編集は「重なっている」ではなく「範囲の外」と報告されます。
	</p>
</div>

<ChapterFooter chapter={c} />
