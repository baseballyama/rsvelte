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
		ノードごとに <code>Box</code> を作らないので、文書を組み立てるときの割り当ては、四本のベクタ（<code>nodes</code>、<code
			>breaks</code
		>、<code>kids</code>、<code>buf</code>）が伸びる分だけです。テキストも、実行時に作った文字列は <code>buf</code> に追記し、ノードはその範囲だけを持ちます。
	</p>
</div>

<Code item={data.code.text} />

<div class="prose-learn">
	<p>
		閉じタグ <code>&lt;/div&gt;</code> のように、いくつかの断片をつないだテキストは <code>text_parts</code> で作ります。<code
			>format!</code
		>
		で一度 <code>String</code> を作ってから <code>text</code> に渡すと、その <code>String</code> の分だけ割り当てが増えます。<code
			>text_parts</code
		>
		は断片を <code>buf</code> に直接書きます。Svelte の整形器がこれを使うようにした変更で、1 ラウンドの割り当ては 2,192,937 回から 2,021,660
		回に減りました（<code>svelte.format</code> 単独では 691,547 回から 520,270 回。e0ef873545）。
	</p>
</div>

<Code item={data.code.textParts} />

<div class="prose-learn">
	<p>
		四本のベクタそのものも、文書ごとに作り直しません。<code>Docs</code> はスレッドのプールから <code>Docs</code>
		という鍵でバッファを借り、<code>Drop</code> で逆の順に返します（<a href="/learn/kernel/pool#keyed">12</a>）。
	</p>
</div>

<Code item={data.code.pooled} />

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

<Code item={data.code.run} mark={['let brk = self.docs.will_break(id);', 'if !brk && self.fits(&flat, stack, self.rem(), false)', 'self.remeasure = true']} />

<div class="prose-learn">
	<p>
		line は、flat モードなら空白（softline なら何もなし）、break モードなら改行とインデントになります。hardline
		は平らな group の中でも必ず改行します。そのとき <code>remeasure</code> を立て、次の group では親のモードに関係なく測り直します。改行したあとは、行の残りの幅が変わっているからです。
	</p>
	<p>
		group を判断するとき、プリンタはまず <code>will_break</code> を見ます。hardline や breakParent、あるいは最初から break
		と指定された group（<code>group_broken</code>）を中に含む group は、幅に関係なく break です。図の「hardline」を選ぶと、外側の group が
		<code>broken</code> と判断されるのが分かります。
	</p>
	<p>
		Prettier はこの判断のために、印字の前に <code>propagateBreaks</code> で木を一度なめ、group の <code>break</code>
		を書き換えます。カーネルでは、これをノードを作る時点で済ませます。ノードは自分より前に作られたノードしか参照できないので、子の答えは親を作るときにはすでに出ています。<code
			>push</code
		>
		はノードと一緒に、<code>breaks_of</code> の答えを <code>breaks</code> に一つ積みます。
	</p>
</div>

<Code item={data.code.push} mark={['self.breaks.push(breaks);']} />

<Code item={data.code.breaksOf} mark={['} => brk || any(self.kids(start, len)),']} />

<div class="prose-learn">
	<p>
		以前は印字の前に木をなめる <code>propagate_breaks</code> があり、hardline と breakParent だけを数えていました。そのため
		<code>group(["x", line, group(["y"], {'{'} shouldBreak: true {'}'})])</code> を、Prettier 3.9.9 は <code>x\ny</code> と印字するのに、カーネルは
		<code>x y</code> と印字していました。作る時点で数える形に変えたときに、<code>brk</code> の立った group も数えるようにしました。Svelte
		のコーパスでは整形の出力が 37 ファイルで変わり、そのうち 35 ファイルがオラクルと一致するようになりました。一致していたファイルが外れた例はありません（708a4403d5）。
	</p>
</div>

<Code item={data.code.builtBrokenTest} />

<div class="prose-learn">
	<H2 id="fits" />
	<p>
		<code>fits</code> は、平らに印字したら何列使うかを数えます。ただし、group の中身だけを数えるのではありません。group
		のあとに続く、スタックに残ったコマンド（<dfn>rest commands</dfn>）も、最初の改行に出会うまで数えます。
	</p>
</div>

<Code item={data.code.fits} />
<Code item={data.code.fitsIn} mark={['rest_i -= 1;', 'if must_be_flat && brk {', 'if mode == Mode::Break || matches!(kind, LineKind::Hard | LineKind::Literal)']} />

<div class="prose-learn">
	<p>
		<code>fits</code> は group を判断するたびに呼ばれるので、作業リストのベクタは <code>Printer</code> が持つ <code>scratch</code>
		を使い回し、呼び出しごとに確保しません。数える本体は <code>fits_in</code> です。
	</p>
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
		<code>print</code> は、<code>flat_only</code> が収まらないと分かった時点で印字をやめます。どうせ呼び出し側には
		<code>Refused</code> しか返らないので、残りを印字しても無駄になるからです。
	</p>
	<p>
		改行のたびに、行末の空白とタブを取り除きます（literalline では取り除きません）。
	</p>
</div>

<Code item={data.code.newline} />

<div class="prose-learn">
	<p>
		幅は Rust の <code>unicode-width</code> に任せています。東アジア幅に加えて、結合文字や ZWJ
		絵文字などの文字列内の並びも扱うため、このプロジェクトで Unicode の表を生成して持つ必要はありません。これは端末風の表示列数を安定して見積もるための規則であり、フォントによる実際の描画幅や
		Prettier の歴史的な規則との完全一致を目的にはしていません。<Note
			>この教材のブラウザ上のプリンタ（図 8.1）は依存を増やさないため、東アジアの全角を 2 列、結合文字を 0 列と数える小さな近似を使います。複雑な絵文字列では
			Rust と答えが違うことがあります。</Note
		>
	</p>
	<p>
		Unicode データと複合列の判定は crate が所有し、このリポジトリのテストは ASCII、CJK、結合文字、絵文字という必要な意味を確認します。依存バージョンは
		<code>Cargo.lock</code> が固定するため、同じツリーの整形結果は再現できます。
	</p>
</div>

<Code item={data.code.stringWidth} />

<div class="prose-learn">
	<H2 id="mutation" />
	<p>
		アリーナのノードは、作ったあと変わらないように見えます。しかし、そうではない箇所があります。
	</p>
	<ul>
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

<div class="prose-learn">
	<p>
		Prettier は <code>propagateBreaks</code> を印字の直前に走らせるので、trim のあとの木で数え直します。一方
		<code>Docs</code> は <code>will_break</code> をノードを作るときに決めてしまいます。そこで <code>replace_parts</code>
		は、子リストを差し替えたあと持ち主の答えを数え直します。子を取り除いても break が増えることはないので、数え直すのは元の答えが
		true のときだけです。trim は内側から順に差し替えるので、子の答えはその時点で最新です。以前はこの数え直しがなく、hardline
		を取り除かれた group が壊れたまま印字されていました（e8196d855b）。fixtures の出力でこの形を踏むものは一つもありません（105,387
		件中 0 件が変化）。修正前に落ちる単体テスト <code>a_trimmed_hard_line_no_longer_breaks</code> で固定しています。
	</p>
</div>

<Caution>
	同じノードを木の二か所で共有していると、<code>trim</code> で片方を整えたつもりが、もう片方も変わります。ノードは
	<code>Copy</code> な ID で配れるので、共有は簡単に起きます。それでも複製する形にしないのは、上流の prettier-plugin-svelte
	も配列をその場で書き換えていて、共有された doc についての出力を上流と揃えるためです（<a href="/learn/polish#correctness"
		>14 磨きどころ</a
	>）。
</Caution>

<ChapterFooter chapter={c} />
