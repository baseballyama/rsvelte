<script lang="ts">
	import type { PageData } from './$types';
	import Term from '$lib/components/Term.svelte';
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import DeepDive from '$lib/components/DeepDive.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import LineIndexExplorer from '$lib/widgets/LineIndexExplorer.svelte';

	let { data }: { data: PageData } = $props();
	const c = chapter('source', 'ja');
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="構文木のノード、診断、位置の対応、lint の指摘。カーネルの中を流れるものは、ほとんどすべてが位置を持っています。この章では、その位置の表し方と、JavaScript の道具が期待する「行と列」への変換を見ます。"
/>

<div class="prose-learn">
	<H2 id="span" />
	<p>
		位置は <dfn>Span</dfn> で表します。一つの文書の中の、半開区間の ユニコードの8ビット符号化方式 バイト範囲です。二つの <code>u32</code>
		だけを持つので、大きさは 8 バイトです。
	</p>
</div>

<Code item={data.code.span} />

<div class="prose-learn">
	<p>
		ファイルの識別番号を持っていないことに注意してください。構文木のノードは何万個もできるので、ノードごとに 4 バイト足すだけでも積み重なります。一方で、どの文書の位置かは常に文脈から分かります。<Term name="DocumentContext" />
		は一つの文書にしか属さず、タスクも一つの文書について走るからです。
	</p>
	<p>
		<code>Span::new</code> は <code>start_offset &lt;= end_offset</code> と上限を確かめますが、<code>debug_assert!</code> なので、release
		ビルドでは何も確かめません。パーサは読んだテキストから Span を作るので、ここは一番よく通る道で、比較一回でも積み重なります。外から来た位置（tsc
		のレポート）は、Span を作る前に解析の側で確かめています<Note
			>範囲を外れた Span で <code>Span::text</code> を呼ぶと、release でもスライスの境界チェックで panic します。黙って壊れるわけではありませんが、壊れた値が作られた場所ではなく、使われた場所で止まります。</Note
		>。
	</p>
</div>

<Code item={data.code.spanNew} />

<div class="prose-learn">
	<H2 id="loc" />
	<p>
		変換の途中で、ソースのどこにも対応しないノードが生まれることがあります。コンパイラが足す <code>$.get(...)</code>
		の呼び出しなどです。こうしたノードに偽の Span を持たせると、位置の対応やエラー位置が静かに間違います。そこで、ノードの位置には
		<dfn>元のソース上の位置の有無</dfn> という別の型を使います。
	</p>
</div>

<Code item={data.code.location} />
<Code item={data.code.synthetic} />

<div class="prose-learn">
	<p>
		<Term name="SourceLocation" /> も 8 バイトです。「合成された」ことを、両端が <code>u32::MAX</code> という、実在の Span がとりえない値で表しています。そのため、ソースの長さには上限が必要になります。
	</p>
</div>

<Code item={data.code.max} />

<div class="prose-learn">
	<p>
		上限を確かめるのは、テキストがパイプラインに入る一か所だけです。<code>Document::new</code> が長さを見て、超えていれば
		<code>TooLarge</code> を返します。<code>Document</code> は <code>#[non_exhaustive]</code> なので、crate
		の外からはこの関数を通らずに作れません。
	</p>
</div>

<Code item={data.code.docNew} mark={['MAXIMUM_SOURCE_LENGTH']} />

<div class="prose-learn">
	<p>
		<Term name="SourceLocation" /> から <code>Span</code> を取り出す方法は <Term name="SourceLocation::span" /> しかなく、戻り値は
		<code>Option</code> です。合成されたノードの場合を処理しない限り、位置は手に入りません。
	</p>
</div>

<Code item={data.code.locationSpan} />

<div class="prose-learn">
	<H2 id="line-index" />
	<p>
		カーネルの中の位置はバイトで持ち、出力先の形式に合わせて行と列へ変換します。
		たとえばコード検査の診断や source map は、行と列で位置を表します。しかも JavaScript の道具が数える「列」は、バイトでも文字でもなく、<strong
			>ユニコードの16ビット符号化方式 のコード単位</strong
		>です。
	</p>
	<p>
		この変換を受け持つのが <dfn>LineIndex</dfn> です。文書ごとに一度だけ作り、<Term name="DocumentContext::line_index" /> がキャッシュします。
	</p>
</div>

<Code item={data.code.lineIndex} />
<Code item={data.code.lineCol} />

<LineIndexExplorer />

<div class="prose-learn">
	<p>
		<code>line_starts</code> には各行の先頭のバイト位置が入ります。バイト位置から行を求めるには、この配列を二分探索するだけです。
	</p>
	<p>
		列の計算にはもう一つ表が要ります。<code>wide</code> には、英数字などの基本文字 でない文字ごとに、そのバイト範囲（始まりと終わり）と、始まりの
		ユニコードの16ビット符号化方式 での位置を並べます。英数字などの基本文字 だけの文書では、この表は空のままです。英数字などの基本文字 では 1 バイトが ユニコードの16ビット符号化方式 の 1
		単位なので、バイト位置をそのまま返せばよいからです。<code>fixtures/svelte</code> の 19,503 文書では、18,419 文書（94%）が 英数字などの基本文字 だけでできていて、この近道を通ります<Note>7a09c5b1f1 の各検証例の <code>input.svelte</code> を読み、全バイトが 0x80 未満かを数えました。</Note>。
	</p>
</div>

<Code item={data.code.wide} />
<Code item={data.code.indexNew} mark={['is_ascii']} />

<div class="prose-learn">
	<p>
		索引はテキストを持ちません。どの問い合わせも、行の先頭の表、改行が二文字（<code>\r\n</code>）の行の表、<code>wide</code> の三つと文書の長さだけで答えます。以前は <code>utf16</code>
		がテキストを受け取って位置の直前の文字をデコードしていたので、呼び出し側が別のテキストを渡す間違いが起こりえました。今はそもそも渡せません（91fec70a6d）。
	</p>
</div>

<div class="prose-learn">
	<H2 id="utf16" />
	<p>
		<code>utf16(byte)</code> は、<code>byte</code> より前で終わる最後の非 英数字などの基本文字 文字を <code>wide</code>
		から二分探索で見つけ、そこからは 英数字などの基本文字 だけが続くことを利用して差を足します。<code>byte</code> が多バイト文字の途中を指していれば、その文字の始まりの位置を返し、文書の終わりを越えていれば終わりの位置を返します。
	</p>
</div>

<Code item={data.code.utf16} />

<div class="prose-learn">
	<p>
		以前の <code>utf16</code> は、直前の文字をデコードしてその長さを引いていました。多バイト文字の途中の位置を渡すと引き算があふれ、debug
		ビルドでは panic、release ビルドでは巨大な列になっていました（<code>utf16("é", 1)</code>）。<code>Emitter::lookup</code>
		の計算から到達できる道だったので、表だけで答える形に書き直しました。テストは混ざったテキストを先頭から歩き、すべての境目が歩いた結果と一致すること、逆向きにも戻ることを確かめます。書き直しの費用は、非
		英数字などの基本文字 文字 1 つあたり 8 バイトから 12 バイトになった表の分で、1 ラウンドの確保バイト数が 11,808 増えました。割り当て回数と命令数は変わっていません（91fec70a6d）。
	</p>
</div>

<Code item={data.code.roundTest} />

<div class="prose-learn">
	<p>
		図の「Rust のテスト」を選ぶと、カーネルのテストと同じ入力 <code>a😀b\nc</code> になります。絵文字 😀 は ユニコードの8ビット符号化方式 では 4
		バイト、ユニコードの16ビット符号化方式 ではサロゲートペアの 2 単位です。そのため <code>b</code> はバイト 5 にありますが、列は 3 になります。
	</p>

	<DeepDive title="なぜ文字数ではなく ユニコードの16ビット符号化方式 なのか">
		<p>
			JavaScript の文字列は ユニコードの16ビット符号化方式 で、<code>"😀".length</code> は 2 です。ESLint の <code>column</code>
			も、TypeScript の <code>character</code> も、source map の列も、この単位で数えます。Rust の <code>char</code>
			（Unicode スカラー値）で数えると、絵文字や一部の漢字（中国語・日本語・韓国語 統合漢字拡張 B 以降）を含む行で、上流と位置がずれます。
		</p>
		<p>
			現在のコード検査の出力は列を 1 から数え（<code>column + 1</code>）、型検査の出力は 0 から数えます。どちらも
			<code>LineColumn</code> の <code>column</code> から作ります。
		</p>
	</DeepDive>

	<H2 id="offset" />
	<p>
		逆向きの <code>offset(line, column)</code> も表の二分探索です。行の先頭の ユニコードの16ビット符号化方式 位置に列を足して目標の位置を作り、その位置より前で終わる最後の非
		英数字などの基本文字 文字から、英数字などの基本文字 の分だけバイトを進めます。
	</p>
</div>

<Code item={data.code.offset} />

<div class="prose-learn">
	<p>
		列は行末（改行の直前）までを受け付け、それを越える列と、サロゲートペアの内側を指す列には <code>None</code>
		を返します。近くの本当にある位置に丸めて返すと、呼び出し側は「その位置が存在したか」を区別できないからです。図の下の段で、1
		行目に大きな列を入れると確かめられます。
	</p>
	<p>
		丸めに頼っていた呼び出し側が一つだけありました。tsc のレポートの解析です。tsc は幅 0 の範囲にも <code>~</code>
		を一つ描くので、行末で起きた診断の終端は行末の一つ先の列になります。解析の側がその一つの場合だけを、理由を書いて取り戻しています。
	</p>
</div>

<Code item={data.code.reportEnd} mark={['(end_line, end_column) == (ln, column)']} />

<ChapterFooter chapter={c} />
