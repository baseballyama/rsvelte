<script lang="ts">
	import Caution from '#lib/components/Caution.svelte';
	import ChapterFooter from '#lib/components/ChapterFooter.svelte';
	import ChapterHeader from '#lib/components/ChapterHeader.svelte';
	import Code from '#lib/components/Code.svelte';
	import DeepDive from '#lib/components/DeepDive.svelte';
	import H2 from '#lib/components/H2.svelte';
	import Note from '#lib/components/Note.svelte';
	import { chapter } from '#lib/site.ts';
	import DocumentPrinter from '#lib/widgets/DocumentPrinter.svelte';
	import { call, fill, flatOnly, groupIds, mustBeFlat, remeasure } from './presets';

	let { data } = $props();
	const c = chapter('doc');
</script>

<svelte:head><title>{c.title} — rsvelte 開発者向けの教材</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="整形器はコードを直接文字列にせず、「収まれば 1 行、収まらなければ改行して字下げ」という指示の木を作ります。プリンタがその木を幅に合わせて文字列にします。rsvelte のプリンタ（rsvelte_document_printer）は、Prettier のプリンタを Rust に移植したものです。rsvelte だけの要素 flat_only と文字幅の数え方を除けば、同じ木から Prettier と同じ文字列が出ます。"
/>

<div class="prose-learn">
	<H2 id="ir" />
	<p>
		整形の中間表現は <dfn>LayoutInstruction</dfn>
		と呼ばれる木です。葉はテキストと改行の候補（line）で、節はそれらをまとめる group、字下げの indent
		などです。ファイル冒頭のコメントは、移植元を Prettier の <code>printDocToString</code> と書いています。
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
		<code>Indent</code>、<code>Dedent</code>、<code>FlatOnly</code>、<code>IndentIfBreak</code>
		は、その子の識別番号を直接持ちます。<code>IfBreak</code> は、二つの子（<code>broken</code> と
		<code>flat</code>）を同じように持ちます。
	</p>
</div>

<Code item={data.code.node} />
<Code item={data.code.docs} />

<div class="prose-learn">
	<p>
		ノードごとに <code>Box</code>
		を作らないので、文書を組み立てるときの割り当ては、四本のバッファが伸びる分だけです。ノードの
		<code>nodes</code>、改行の要否と平らに出したときの幅の <code>measures</code>、子のリストの
		<code>children</code>、文字列の
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
		四本のバッファそのものも、文書ごとに作り直しません。アリーナは自分の型を鍵にしてスレッドのプールからバッファを借り、<code
			>Drop</code
		>
		で借りた順の逆に返します（仕組みは <a href="/learn/kernel/buffer-pool#keyed">13 章</a>）。
	</p>
</div>

<Code item={data.code.pooled} />

<div class="prose-learn">
	<H2 id="printer" />
	<p>
		プリンタは、コマンドのスタックを回すループです。コマンド（<code>Command</code
		>）は（インデント、モード、要素）の三つ組で、モードは
		<dfn>flat</dfn>（平らに 1 行で）か <dfn>break</dfn>（改行する）です。
	</p>
	<p>
		break モードで group に着くと、その group が一行に収まるかを <code>fits</code>
		で調べます。収まれば flat、収まらなければ break で中身を積みます。flat モードの中の group は、測らずに
		flat のまま出力します。例外は、強制改行を含む group と、直前に hardline を出力したときです。
	</p>
</div>

<DocumentPrinter
	label="図 9.1 · 文書プリンタ"
	presets={[call, fill, groupIds, flatOnly, remeasure]}
/>

<Code
	item={data.code.run}
	mark={['self.choose_group(identifier, indentation, mode, stack)', 'self.remeasure = true']}
/>
<Code
	item={data.code.chooseGroup}
	mark={[
		'let breaks_line = self.docs.will_break(identifier);',
		'else if self.fits(&flat, stack, self.remaining(), false)',
	]}
/>

<div class="prose-learn">
	<p>
		line は、flat モードなら空白（softline なら何もなし）、break
		モードなら改行とインデントになります。hardline は平らな group の中でも必ず改行します。そのとき <code
			>remeasure</code
		> を立て、次の group では親のモードに関係なく測り直します。改行したあとは、行の残りの幅が変わっているからです。
	</p>
	<p>
		group を判断するとき、プリンタはまず <code>will_break</code>
		を見ます。hardline、literalline、breakParent のどれかを中に含む group は、幅に関係なく break です。最初から
		break と指定した group（<code>group_broken</code
		>）を含む場合も同じです。図の「hardline」を選ぶと、外側の group が
		<code>broken</code> と判断されるのが分かります。
	</p>
	<p>
		Prettier はこの判断のために、出力の前に <code>propagateBreaks</code> で木を一度たどり、group の
		<code>break</code>
		を書き換えます。rsvelte のプリンタでは、これをノードを作る時点で済ませます。ノードは自分より前に作られたノードしか参照できないので、子の答えは親を作るときにはすでに出ています。<code
			>push</code
		>
		はノードと一緒に、<code>measure_of</code> の答えを <code>measures</code>
		に一つ積みます。答えは一つの 32 ビット整数で、最上位のビットが改行の要否、残りが平らに出したときの幅です（幅は次の節の
		<code>fits</code> が使います）。
	</p>
</div>

<Code item={data.code.push} mark={['self.measures.push(measure);']} />

<Code item={data.code.measureOf} mark={['if breaks_line {']} />

<div class="prose-learn">
	<p>
		以前は、出力の前に <code>propagate_breaks</code>
		が整形指示の木全体をたどっていました。数えていたのは hardline と breakParent だけです。そのため
		<code>group(["x", line, group(["y"], {'{'} shouldBreak: true {'}'})])</code>
		という入力で違いが出ました。<code>shouldBreak: true</code> は、最初から break と指定した group
		です。Prettier 3.9.9 は <code>x\ny</code> と改行しますが、rsvelte のプリンタは <code>x y</code>
		と出力していました。ノードを作る時点で数える今の形では、<code>breaks_line</code> の立った group も数えます。Svelte
		の検証用のソースファイル集は、公式ツールの出力と比べる、実在する Svelte ファイルの集まりです。この修正で、その整形の出力が
		37 ファイルで変わりました。35 ファイルは Prettier と一致に変わり、2 ファイルは違ったままです。その
		2 ファイルは、Prettier が条件付きの group で選ぶ引数のレイアウトで、まだ移植していません。一致していたファイルが外れた例はありません。
	</p>
</div>

<Code item={data.code.builtBrokenTest} />

<div class="prose-learn">
	<H2 id="fits" />
	<p>
		<code>fits</code> は、平らに出力したら何列使うかを数えます。数えるのは group
		の中身と、その後ろでスタックに残ったコマンド（<dfn>rest commands</dfn
		>）で、最初の改行に出会うまでです。
	</p>
</div>

<Code item={data.code.fits} />
<Code
	item={data.code.fitsIn}
	mark={[
		'rest_i -= 1;',
		'&& let Some(width) = self.docs.measure(identifier).width()',
		'if must_be_flat && breaks_line {',
		'if mode == Mode::Break || matches!(kind, LineKind::Hard | LineKind::Literal)',
	]}
/>

<div class="prose-learn">
	<p>
		<code>fits</code> は group を判断するたびに呼ばれるので、作業リストのベクタは
		<code>Printer</code>
		が持つ <code>scratch</code>
		を使い回し、呼び出しごとに確保しません。数える本体は <code>fits_in</code> です。
	</p>
	<p>
		強制改行も名前付きの group も含まない部分木は、中をたどりません。<code>measure_of</code>
		がノードを作るときに求めた幅を、まとめて引きます。group を判断するたびに同じ部分木をたどり直すことがなくなりました。検証用のソースファイル集の整形では、<code
			>fits</code
		> の命令数が約 3 分の 1 になりました。
	</p>
	<p>
		たとえば <code>f(a, b);</code> の group が収まるかは、閉じ括弧のあとの <code>;</code>
		まで含めて決まります。group だけ見て「収まる」と判断すると、<code>;</code> がはみ出します。rest commands
		は自分のモードで数えるので、break モードの line に着いたところで「そこで改行できる」として true を返します。
	</p>

	<H2 id="fill" />
	<p>
		<dfn>fill</dfn> は、段落の文字詰めのように、収まるだけ一行に並べてから改行します。子は内容と区切りを交互に並べたもので、プリンタは二つずつ判断します。
	</p>
</div>

<Code item={data.code.fill} />

<div class="prose-learn">
	<p>
		区切りを flat にするかは、「内容、区切り、次の内容」の三つ組が平らに収まるかで決めます。このとき
		<code>fits</code> は <code>must_be_flat</code> で呼ばれ、中に強制改行の group があれば、その時点で「収まらない」と答えます。
	</p>

	<DeepDive title="mustBeFlat にはテストがなかった">
		<p>
			この教材を作る途中で、<code>must_be_flat</code> の分岐を消しても Rust のテストがすべて通ることに気づきました。そこで、強制改行の
			group を内容に持つ fill のテストを足しました。
		</p>
		<p>
			分岐を消すと、区切りの判断で中の group の line を「break モードの line に着いた」と数え、true
			を返します。すると区切りが平らになり、<code>b c</code> が同じ行に並びます。
		</p>
	</DeepDive>
</div>

<Code item={data.code.mustBeFlatTest} />

<DocumentPrinter label="図 9.2 · mustBeFlat" presets={[mustBeFlat]} />

<div class="prose-learn">
	<H2 id="group-ids" />
	<p>
		<code>if_break</code> は、囲む group が break なら一つ目、flat なら二つ目を出力します。<code
			>if_break_of</code
		>
		は、囲む group の代わりに、識別子（group id）で指定した group のモードに従います。
	</p>
</div>

<Code item={data.code.ifBreakBranch} />

<div class="prose-learn">
	<p>
		プリンタは識別子の付いた group を判断すると、そのモードを <code>group_modes</code>
		に記録します。まだ判断していない group を参照すると、flat として扱います<Note
			>Prettier の <code>printDocToString</code> も、未判断の group は flat として扱います。</Note
		>。<code>indent_if_break</code> も同じ表を見て、指定した group が break のときだけ字下げします。
	</p>

	<H2 id="flat-only" />
	<p>
		rsvelte のプリンタには、Prettier にない要素が一つだけあります。<dfn>flat_only</dfn> です。
	</p>
</div>

<Code item={data.code.flatOnly} />

<div class="prose-learn">
	<p>
		整形器の移植はまだ途中で、改行したときのレイアウトを移植していない構文があります。そうした構文を
		flat_only で包んでおくと、幅に収まる限りは正しく 1
		行に出力し、収まらないときは出力そのものを拒否（<code>Refused</code
		>）します。収まらないときに「それらしく」改行すると、Prettier
		が出さないレイアウトを出してしまうからです。<a href="/learn/kernel/diagnostics#unsupported"
			>07 章</a
		>の「近似しない」をプリンタに持ち込んだものです。図 9.1
		の「flat_only」で、幅を狭めてみてください。
	</p>
</div>

<Code item={data.code.print} mark={['if p.refused { Err(Refused) } else { Ok(p.out) }']} />

<div class="prose-learn">
	<p>
		<code>print</code> は、<code>flat_only</code>
		が収まらないと分かった時点で出力をやめます。呼び出し側には
		<code>Refused</code> しか返らないので、残りを出力しても無駄だからです。
	</p>
	<p>改行のたびに、行末の空白とタブを取り除きます（literalline では取り除きません）。</p>
</div>

<Code item={data.code.newline} />

<div class="prose-learn">
	<p>
		幅は Rust の <code>unicode-width</code> crate
		で数えます。全角の東アジア文字に加え、結合文字や、ゼロ幅接合子でつないだ絵文字の並びも扱うので、このプロジェクトで
		Unicode の表を持つ必要はありません。表示できる ASCII
		だけの文字列は、バイト数をそのまま幅にします。数えるのは端末での表示列数で、フォントで描いたときの実際の幅や、Prettier
		の <code>getStringWidth</code> の表との完全な一致は目的にしていません。<Note
			>この教材のブラウザ上のプリンタ（図 9.1）も、WebAssembly を通して同じ Rust の <code
				>string_width</code
			> を使います。</Note
		>
	</p>
	<p>
		このリポジトリのテストは、ASCII、日本語、結合文字、絵文字の幅を確かめます。依存のバージョンは
		<code>Cargo.lock</code> が固定するので、同じツリーなら整形結果も同じです。
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
		Prettier は <code>propagateBreaks</code> を出力の直前に走らせるので、trim
		のあとの木で数え直します。一方、アリーナは <code>will_break</code>
		をノードを作るときに決めてしまいます。そこで <code>set_parts</code>
		は、範囲を縮めたあと持ち主の答え（改行の要否と幅）を数え直します。trim は内側から順に縮めるので、子の答えはその時点で最新です。以前はこの数え直しがなく、hardline
		を取り除いた group も改行したまま出力されていました。この修正で変わった出力は、検証用のソースファイル集の
		105,387 件のうち 0 件です。修正前に落ちる単体テスト
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
