<script lang="ts">
	import Caution from '$lib/components/Caution.svelte';
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import DeepDive from '$lib/components/DeepDive.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import DocPrinter from '$lib/widgets/DocPrinter.svelte';
	import { call, fill, flatOnly, groupIds, mustBeFlat, remeasure } from './presets';

	let { data } = $props();
	const c = chapter('doc');
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="整形器は、コードを直接文字列にしません。「ここは収まれば 1 行、収まらなければ改行してインデント」という指示の木を作り、プリンタがそれを幅に合わせて文字列にします。カーネルのプリンタは Prettier のものを移植したもので、同じ木からは同じ文字列が出ます。"
/>

<div class="prose-learn">
	<H2 id="ir" />
	<p>
		整形の中間表現は <dfn>Doc</dfn> と呼ばれる木です。葉はテキストと改行の候補（line）で、節はそれらをまとめる group、字下げの indent などです。Prettier
		の論文ではなく実装（<code>printDocToString</code>）を移植していて、ファイル冒頭のコメントがそれを約束しています。
	</p>
	<blockquote class="font-mono text-[14px] leading-[1.7] whitespace-pre-line text-fg-2" lang="en">{data.docs}</blockquote>
	<p>改行の候補には四種類あります。</p>
</div>

<Code item={data.code.lineKind} />

<div class="prose-learn">
	<p>
		ノードは <code>Copy</code> な enum で、子を持つノードは子のリストへの範囲（<code>start</code>, <code>len</code>）だけを持ちます。リストの中身は
		<code>Docs::kids</code> という一本のベクタに並びます。
	</p>
</div>

<Code item={data.code.node} />
<Code item={data.code.docs} />

<div class="prose-learn">
	<p>
		ノードごとに <code>Box</code> を作らないので、文書を組み立てるときの割り当ては、四本のベクタが伸びる分だけです。テキストも、実行時に作った文字列は
		<code>buf</code> に追記し、ノードはその範囲だけを持ちます。
	</p>
</div>

<Code item={data.code.text} />

<div class="prose-learn">
	<H2 id="printer" />
	<p>
		プリンタは、コマンドのスタックを回すループです。コマンドは (インデント, モード, 要素) の三つ組で、モードは <dfn>flat</dfn>（平らに 1
		行で）か <dfn>break</dfn>（改行する）のどちらかです。
	</p>
	<p>
		肝心なのは group の扱いです。break モードの中で group に出会うと、プリンタは「この group を平らに印字したら、今の行の残りに収まるか」を
		<code>fits</code> で調べ、収まれば flat、収まらなければ break で中身を積みます。flat モードの中の group は、親が平らなのでそのまま平らです。
	</p>
</div>

<DocPrinter label="図 8.1 · 文書プリンタ" presets={[call, fill, groupIds, flatOnly, remeasure]} />

<Code item={data.code.run} mark={['Node::Group {', 'if !brk && self.fits(&flat, &stack, self.rem(), false)', 'self.remeasure = true']} />

<div class="prose-learn">
	<p>
		line は、flat モードなら空白（softline なら何もなし）、break モードなら改行とインデントになります。hardline
		は平らな group の中でも必ず改行します。そのとき <code>remeasure</code> を立て、次の group では親のモードに関係なく測り直します。改行したあとは、行の残りの幅が変わっているからです。
	</p>
	<p>
		実はプリンタは、印字を始める前に <code>propagate_breaks</code> で木を一度なめ、hardline や breakParent を含む group
		をすべて「最初から break」にしておきます。図の「hardline」を選ぶと、外側の group が <code>broken</code> と判断されるのが分かります。
	</p>
</div>

<Code item={data.code.breaks} />

<div class="prose-learn">
	<H2 id="fits" />
	<p>
		<code>fits</code> は、平らに印字したら何列使うかを数えます。ただし、group の中身だけを数えるのではありません。group
		のあとに続く、スタックに残ったコマンド（<dfn>rest commands</dfn>）も、最初の改行に出会うまで数えます。
	</p>
</div>

<Code item={data.code.fits} mark={['rest_i -= 1;', 'if must_be_flat && brk {', 'if mode == Mode::Break || matches!(kind, LineKind::Hard | LineKind::Literal)']} />

<div class="prose-learn">
	<p>
		たとえば <code>f(a, b);</code> の group が収まるかは、閉じ括弧のあとの <code>;</code> まで含めて決まります。group
		だけ見て「収まる」と判断すると、<code>;</code> がはみ出します。rest commands は自分のモードで数えるので、break
		モードの line に着いたところで「そこで改行できる」として true を返します。
	</p>

	<H2 id="fill" />
	<p>
		<dfn>fill</dfn> は、段落の文字詰めのように、収まるだけ一行に並べてから改行します。子は「内容, 区切り, 内容, 区切り, …」と交互に並び、プリンタは二つずつ判断します。
	</p>
</div>

<Code item={data.code.fill} />

<div class="prose-learn">
	<p>
		区切りを flat にするかは、<strong>[内容, 区切り, 次の内容]</strong>の三つ組が平らに収まるかで決めます。このとき
		<code>fits</code> は <code>must_be_flat</code> で呼ばれ、中に強制改行の group があれば、その時点で「収まらない」と答えます。
	</p>

	<DeepDive title="mustBeFlat にはテストがなかった">
		<p>
			この教材を作る途中で、TypeScript の移植から <code>must_be_flat</code> の分岐を消しても、Rust から移したテストがすべて通ることに気づきました。Rust
			側でも同じで、この分岐を判別するテストがありませんでした。そこで、強制改行の group を内容に持つ fill のテストを Rust
			に足し、期待値を Rust の出力から取ってから、移植にも同じテストを入れました。
		</p>
		<p>
			分岐を消すと、区切りの判断で中の group の line を「break モードの line に着いた」と数えて true を返し、区切りが平らになってしまいます（<code
				>b c</code
			>
			が同じ行に並ぶ）。
		</p>
	</DeepDive>
</div>

<Code item={data.code.mustBeFlatTest} />

<DocPrinter label="図 8.2 · mustBeFlat" presets={[mustBeFlat]} />

<div class="prose-learn">
	<H2 id="group-ids" />
	<p>
		<code>if_break</code> は、囲む group が break なら一つ目、flat なら二つ目を印字します。<code>if_break_of</code>
		は囲む group ではなく、名前（group id）で指定した group のモードに従います。
	</p>
</div>

<Code item={data.code.ifBreakBranch} />

<div class="prose-learn">
	<p>
		名前を付けた group のモードは、プリンタがその group を判断したときに <code>group_modes</code> に記録されます。まだ判断していない
		group を参照すると、flat として扱います<Note
			>Prettier の <code>printDocToString</code> も、未判断の group は flat として扱います。</Note
		>。<code>indent_if_break</code> も同じ表を見て、名前の group が break のときだけ字下げします。
	</p>

	<H2 id="flat-only" />
	<p>
		カーネルのプリンタには、Prettier にない要素が一つだけあります。<dfn>flat_only</dfn> です。
	</p>
</div>

<Code item={data.code.flatOnly} />

<div class="prose-learn">
	<p>
		整形器の移植は途中で、改行したときのレイアウトをまだ移植していない構文があります。そうした構文を flat_only
		で包んでおくと、幅に収まる限りは正しく 1 行に印字し、収まらないときは印字そのものを拒否（<code>Refused</code>）します。収まらないときに「それらしく」改行すると、Prettier
		が出さないレイアウトを出してしまうからです。<a href="/learn/kernel/diagnostics#unsupported">07</a> の「近似しない」をプリンタに持ち込んだものです。図 8.1 の「flat_only」で、幅を狭めてみてください。
	</p>
</div>

<Code item={data.code.print} mark={['if p.refused { Err(Refused) } else { Ok(p.out) }']} />

<div class="prose-learn">
	<p>
		改行のたびに、行末の空白とタブを取り除きます（literalline では取り除きません）。幅は Prettier の
		<code>getStringWidth</code> と同じく、全角の文字を 2 列、結合文字を 0 列として数えます。
	</p>
</div>

<Code item={data.code.newline} />
<Code item={data.code.stringWidth} />

<div class="prose-learn">
	<H2 id="mutation" />
	<p>
		アリーナのノードは、作ったあと変わらないように見えます。しかし、そうではない箇所が三つあります。
	</p>
	<ul>
		<li><code>propagate_breaks</code> は、印字の前に group の <code>brk</code> を書き換えます。</li>
		<li>
			<code>trim_left</code> と <code>trim_right</code> は、prettier-plugin-svelte の <code>trim</code> を移植したもので、<code
				>replace_parts</code
			>
			で既存のノードの子リストを差し替えます。
		</li>
		<li><code>remove_lines</code> は逆に、元のノードを変えずに新しいノードを作って返します。</li>
	</ul>
</div>

<Code item={data.code.replaceParts} />

<Caution>
	同じノードを木の二か所で共有していると、<code>trim</code> で片方を整えたつもりが、もう片方も変わります。ノードは
	<code>Copy</code> な ID で配れるので、共有は簡単に起きます。それでも複製する形にしないのは、上流の prettier-plugin-svelte
	も配列をその場で書き換えていて、共有された doc についての出力を上流と揃えるためです（<a href="/learn/polish#correctness"
		>14 磨きどころ</a
	>）。
</Caution>

<ChapterFooter chapter={c} />
