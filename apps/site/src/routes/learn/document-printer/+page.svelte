<script lang="ts">
	import Caution from '#lib/components/Caution.svelte';
	import ChapterFooter from '#lib/components/ChapterFooter.svelte';
	import ChapterHeader from '#lib/components/ChapterHeader.svelte';
	import Code from '#lib/components/Code.svelte';
	import H2 from '#lib/components/H2.svelte';
	import { chapter } from '#lib/site.ts';

	let { data } = $props();
	const c = chapter('doc');
</script>

<svelte:head><title>{c.title} — rsvelte 開発者向けの教材</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="整形器はコードを直接文字列にせず、「収まれば 1 行、収まらなければ改行して字下げ」という指示の木を作ります。木の要素は Prettier の doc と同じです。rsvelte はこの木を oxc の整形器の要素に写します。文字列にするのは oxc のプリンタです。"
/>

<div class="prose-learn">
	<H2 id="ir" />
	<p>
		整形の中間表現は <dfn>LayoutInstruction</dfn>
		と呼ばれる木です。葉はテキストと改行の候補（line）で、節はそれらをまとめる group、字下げの indent
		などです。
	</p>
	<blockquote class="font-mono text-[14px] leading-[1.7] whitespace-pre-line text-fg-2" lang="en">
		{data.docs}
	</blockquote>
	<p>
		改行の候補には四種類あります。<code>Normal</code> が line、<code>Soft</code> が softline、<code
			>Hard</code
		>
		が hardline、<code>Literal</code> が literalline です。
	</p>
</div>

<Code item={data.code.lineKind} />

<div class="prose-learn">
	<p>
		木のノードは、文書ごとに一つのアリーナ <code>LayoutInstructions</code
		>（整形の指示をまとめて入れておく領域）に入れます。ノードは <code>Copy</code> な enum
		です。子を並べる <code>Concat</code>、<code>Group</code>、<code>Fill</code>
		は、子のリストへの範囲（<code>start</code>,
		<code>len</code>）を持ちます。リストの中身は
		<code>LayoutInstructions::children</code> という一本のベクタに並びます。子が一つの
		<code>Indent</code>、<code>Dedent</code>、<code>IndentIfBreak</code>
		は、その子の識別番号を直接持ちます。<code>IfBreak</code> は、二つの子（<code>broken</code> と
		<code>flat</code>）を同じように持ちます。
	</p>
</div>

<Code item={data.code.node} />
<Code item={data.code.docs} />

<div class="prose-learn">
	<p>
		ノードごとに <code>Box</code>
		を作らないので、文書を組み立てるときの割り当ては、三本のバッファが伸びる分だけです。ノードの
		<code>nodes</code>、子のリストの <code>children</code>、文字列の
		<code>buffer</code> です。実行時に作ったテキストも <code>buffer</code> に追記し、ノードはその範囲だけを持ちます。
	</p>
</div>

<Code item={data.code.text} />

<div class="prose-learn">
	<p>
		閉じタグ <code>&lt;/div&gt;</code> のように、いくつかの断片をつないだテキストは
		<code>text_parts</code>
		で作ります。<code>format!</code>
		で一度 <code>String</code> を作ってから <code>text</code> に渡すと、その <code>String</code>
		の分だけ割り当てが増えます。<code>text_parts</code>
		は断片を <code>buffer</code> に直接書きます。この関数を入れた変更（コミット
		<code>e0ef873545</code>）は、整形器が借用に切り替えた変更も含みます。合わせて、1
		ラウンド（性能の基準値で全文書を一回処理する分、<a href="/learn/measure">14 章</a>）の割り当ては
		2,192,937 回から 2,021,660 回に減りました。そのうち Svelte の整形の分は 691,547 回から 520,270
		回です。
	</p>
</div>

<Code item={data.code.textParts} />

<div class="prose-learn">
	<p>
		三本のバッファそのものも、文書ごとに作り直しません。アリーナは自分の型を鍵にしてスレッドのプールからバッファを借り、<code
			>Drop</code
		>
		で借りた順の逆に返します（仕組みは <a href="/learn/kernel/buffer-pool#keyed">13 章</a>）。
	</p>
</div>

<Code item={data.code.pooled} />

<div class="prose-learn">
	<H2 id="lower" />
	<p>
		できた木を、rsvelte は自分では文字列にしません。<code>lower</code> が oxc の整形器の要素（<code
			>FormatElement</code
		>）の列に写し、oxc のプリンタがその列を文字列にします。oxc の JavaScript、TypeScript、CSS
		の整形器も、同じ要素の列を作ります。Svelte の整形では、<code>&lt;script&gt;</code>
		や <code>&lt;style&gt;</code>、テンプレートの式を oxc
		の整形器が整形します。テンプレートの木も同じ列に写すので、両方を一つのプリンタが一度に出力できます。
	</p>
	<table>
		<thead><tr><th>LayoutInstructions</th><th>oxc の要素</th></tr></thead>
		<tbody>
			<tr
				><td><code>group</code>、<code>group_with_identifier</code></td><td
					><code>StartGroup</code></td
				></tr
			>
			<tr
				><td><code>fill</code></td><td
					><code>StartFill</code>。子は一つずつ <code>StartEntry</code> で包む</td
				></tr
			>
			<tr
				><td><code>indent</code>、<code>dedent</code></td><td
					><code>StartIndent</code>、<code>StartDedent</code></td
				></tr
			>
			<tr
				><td><code>if_break_of</code></td><td
					><code>StartConditionalContent</code> を二つ（broken 側と flat 側）</td
				></tr
			>
			<tr><td><code>indent_if_break</code></td><td><code>StartIndentIfGroupBreaks</code></td></tr>
			<tr
				><td>line、softline</td><td
					><code>LineMode::SoftOrSpace</code>、<code>LineMode::Soft</code></td
				></tr
			>
			<tr><td>hardline</td><td><code>LineMode::ExactLineBreaks(1)</code></td></tr>
			<tr><td>literalline</td><td><code>LineMode::Literal</code></td></tr>
			<tr><td><code>break_parent</code></td><td><code>ExpandParent</code></td></tr>
		</tbody>
	</table>
	<p>
		Prettier の意味に合わせるため、写し方を変えたところが二つあります。oxc の <code
			>LineMode::Hard</code
		>
		は行頭では改行しませんが、Prettier の hardline は毎回改行します。そこで hardline は
		<code>ExactLineBreaks(1)</code> にします。また、Prettier では改行を含むテキストが group
		を改行させません。そこでテキストは <code>without_expand_parent</code> を付けて書きます。
	</p>
</div>

<Code item={data.code.lower} />
<Code
	item={data.code.lowerNode}
	mark={['Format::fmt(&builders::text(text).without_expand_parent(), f);']}
/>
<Code item={data.code.lineMode} />

<div class="prose-learn">
	<p>
		識別子付きの group（<code>group_with_identifier</code>）は、最初に写すとき oxc の
		<code>GroupId</code>（group の番号）を作ります。同じ識別子を指す
		<code>if_break_of</code>
		と
		<code>indent_if_break</code> は、その <code>GroupId</code>
		を使います。木は入力と同じだけ深くなるので、<code>lower</code>
		は再帰せず、自分のスタックで木をたどります。
	</p>
	<p>
		どの group を改行するかは、oxc のプリンタが決めます。hardline や <code>break_parent</code>
		は、外側の group も改行させます。この処理（Prettier の <code>propagateBreaks</code>）も oxc
		が行います。
	</p>
</div>

<Code item={data.code.hardlineTest} />

<div class="prose-learn">
	<H2 id="embedded" />
	<p>
		oxc の整形器が作った要素の列は、アリーナの外の <code>Embedding</code>
		に保存します。<code>Embedding::keep</code> はその列を保存し、列の番号だけを持つ
		<code>Embedded</code> ノードをアリーナに作ります。<code>lower</code>
		はこのノードに着くと、番号が指す列をそのまま書きます。
	</p>
	<p>
		列の末尾の hardline は取り除きます。Prettier も埋め込んだ部分の末尾の hardline
		を取り除き、その後ろの改行は外側の文書が出すからです。
	</p>
</div>

<Code item={data.code.keep} />

<div class="prose-learn">
	<p>
		<code>Embedding::print</code>
		が、写しと出力をまとめて行います。oxc のプリンタが要素の列を受け付けないこともあります。開きタグと閉じタグが対応しないときなどです。そのときは、整形できないという診断（<code
			>Unsupported</code
		>）を返します。Svelte と Vue の整形は、この診断をそのまま返します。
	</p>
</div>

<Code item={data.code.print} />

<div class="prose-learn">
	<H2 id="width" />
	<p>
		行が幅に収まるかは、文字の表示幅で決まります。oxc のプリンタは幅を <code>unicode-width</code>
		で数え、Prettier は <code>getStringWidth</code>
		で数えます。ほとんどの文字では同じ幅です。違うのは、ゼロ幅接合子（U+200D、絵文字どうしをつなぐ見えない文字）でつないだ絵文字や、肌の色を指定した絵文字の並びです。Prettier
		はこうした並びを一文字（幅 2）と数えます。
	</p>
	<p>
		<code>emoji_measured_otherwise</code>
		は、二つの数え方で幅が変わる並びを探します。見つかった文書は、Svelte と Vue の整形が断ります。幅が違うと、Prettier
		と違う位置で改行することがあるからです。
	</p>
</div>

<Code item={data.code.emojiMeasuredOtherwise} />

<div class="prose-learn">
	<p>
		Prettier 側の幅は <code>string_width</code> が数えます。幅が 2 の文字の表（<code>WIDE</code
		>）は、Prettier 3.9.10
		で全スカラー値を測って作りました。表にない文字は、制御文字、結合文字、異体字セレクタが 0、残りが
		1 です。キーキャップ、国旗、異体字セレクタ 16 で絵文字にした文字は、並び全体で 2
		です。テストは、各文字列の幅を Prettier 3.9.10 で測った値と比べます。
	</p>
</div>

<Code item={data.code.stringWidth} />

<div class="prose-learn">
	<H2 id="mutation" />
	<p>アリーナのノードは作ったあと変わらないように見えますが、trim は既存のノードを書き換えます。</p>
	<ul>
		<li>
			<code>trim_left</code> と <code>trim_right</code> は prettier-plugin-svelte の
			<code>trim</code> の移植です。取り除くのは子リストの先頭か末尾だけなので、<code
				>set_parts</code
			>
			で既存のノードが指す子リストの範囲を縮めます。子リストを写し直すことはありません。
		</li>
		<li><code>remove_lines</code> は逆に、元のノードを変えずに新しいノードを作って返します。</li>
	</ul>
</div>

<Code item={data.code.setParts} />

<div class="prose-learn">
	<p>
		改行の要否は、oxc のプリンタが出力するときに数えます。そのため trim のあとの木で決まり、hardline
		を取り除いた group は改行しません。単体テスト
		<code>a_trimmed_hard_line_no_longer_breaks</code> で固定しています。
	</p>
</div>

<Caution>
	同じノードを木の二か所で共有していると、<code>trim</code>
	で片方を整えたつもりが、もう片方も変わります。ノードは
	<code>Copy</code>
	な識別番号で配れるので、共有は簡単に起きます。それでも複製しないのは、出力を prettier-plugin-svelte
	と揃えるためです。prettier-plugin-svelte も配列をその場で書き換えるので、共有したときの出力も同じになります（<a
		href="/learn/polish#correctness">15 章「磨きどころ」</a
	>）。
</Caution>

<ChapterFooter chapter={c} />
