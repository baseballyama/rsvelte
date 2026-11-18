<script lang="ts">
	import ChapterFooter from '#lib/components/ChapterFooter.svelte';
	import ChapterHeader from '#lib/components/ChapterHeader.svelte';
	import Code from '#lib/components/Code.svelte';
	import DeepDive from '#lib/components/DeepDive.svelte';
	import H2 from '#lib/components/H2.svelte';
	import Note from '#lib/components/Note.svelte';
	import { chapter } from '#lib/site.ts';
	import LineIndexExplorer from '#lib/widgets/LineIndexExplorer.svelte';

	let { data } = $props();
	const c = chapter('source');
</script>

<svelte:head><title>{c.title} — rsvelte 開発者向けの教材</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="カーネル（言語に依存しない共通部分）の中では、構文木のノードも診断もコード検査の指摘も、ほとんどすべてが位置を持ちます。位置をどう表すかと、JavaScript のツールが使う行と列にどう変換するかを説明します。"
/>

<div class="prose-learn">
	<H2 id="span" />
	<p>
		位置は <dfn><code>Span</code></dfn> で表します。一つの文書の中の UTF-8
		のバイト範囲で、終わりを含まない半開区間です。<code>u32</code> を二つ持つだけなので、大きさは 8 バイトです。
	</p>
</div>

<Code item={data.code.span} />

<div class="prose-learn">
	<p>
		<code>Span</code>
		はファイルの識別番号を持ちません。構文木のノードは何万個もできるので、ノードごとに 4 バイト足すだけでも積み重なるからです。どの文書の位置かは、文脈から分かります。計算結果は文書ごとの入れ物
		<code>DocumentContext</code> に置かれ、処理も一つの文書ごとに走ります。
	</p>
	<p>
		<code>Span::new</code> は <code>start_offset &lt;= end_offset</code> と上限を確かめます。ただし
		<code>debug_assert!</code>
		なので、release ビルドでは確かめません。パーサは読んだテキストから <code>Span</code>
		を作るので、ここは最もよく通る道で、比較一回でも積み重なるからです。外から来た位置（TypeScript の
		API が返す行と列）は、<code>Span</code>
		を作る前に確かめます<Note
			>範囲外の <code>Span</code> で <code>Span::text</code> を呼ぶと、release でもスライスの境界チェックで
			panic します。ただし止まるのは、壊れた値を作った場所ではなく、使った場所です。</Note
		>。
	</p>
</div>

<Code item={data.code.spanNew} />

<div class="prose-learn">
	<H2 id="loc" />
	<p>
		変換の途中で、ソースのどこにも対応しないノードも生まれます。たとえばコンパイラが足す <code
			>$.get(...)</code
		>
		の呼び出しです。こうしたノードに偽の <code>Span</code>
		を持たせると、位置の対応やエラー位置が黙って間違います。そこでノードの位置には、別の型
		<code>SourceLocation</code> を使います。ソース上の範囲か、「ソースに対応しない」かのどちらかを表す型です。
	</p>
</div>

<Code item={data.code.location} />
<Code item={data.code.synthetic} />

<div class="prose-learn">
	<p>
		<code>SourceLocation</code> も 8 バイトです。ソースに対応しないノードは、両端を
		<code>u32::MAX</code> にして表します。この値を実在の範囲と区別するため、ソースの長さには上限があります。
	</p>
</div>

<Code item={data.code.max} />

<div class="prose-learn">
	<p>
		上限を確かめるのは、テキストが処理に入る一か所だけです。<code>Document::new</code>
		は、長さが上限以上なら <code>TooLarge</code> を返します。<code>Document</code> は
		<code>#[non_exhaustive]</code> なので、crate の外からはこの関数を通らずに作れません。
	</p>
</div>

<Code item={data.code.docNew} mark={['MAXIMUM_SOURCE_LENGTH']} />

<div class="prose-learn">
	<p>
		<code>SourceLocation</code> から <code>Span</code> を取り出す方法は、<code
			>SourceLocation::span</code
		>
		だけです。戻り値は <code>Option</code> なので、呼び出し側はソースに対応しない場合を必ず処理します。
	</p>
</div>

<Code item={data.code.locationSpan} />

<div class="prose-learn">
	<H2 id="line-index" />
	<p>
		カーネルは位置をバイトで持ち、診断や source map を出すときに行と列へ変換します。JavaScript
		のツールは、列を <strong>UTF-16 のコード単位</strong>で数えます。
	</p>
	<p>
		この変換は <dfn><code>LineIndex</code></dfn> が受け持ちます。文書ごとに一つだけ、<code
			>DocumentContext::line_index</code
		> が初めて呼ばれたときに作り、その後はキャッシュを返します。
	</p>
</div>

<Code item={data.code.lineIndex} />
<Code item={data.code.lineCol} />

<LineIndexExplorer />

<div class="prose-learn">
	<p>
		図の「Rust のテスト」は、カーネルのテスト <code>utf16_columns_count_surrogate_pairs</code>
		と同じ入力 <code>a😀b\nc</code> です。😀 は UTF-8 では 4 バイト、UTF-16 ではサロゲートペアの 2
		単位です。そのため <code>b</code> はバイト 5 にあり、列は 3 です。
	</p>
	<p>
		<code>line_starts</code> は各行の先頭のバイト位置の配列です。バイト位置がどの行にあるかは、この配列の二分探索で求まります。
	</p>
	<p>
		列の計算には、もう一つの表 <code>wide</code> を使います。ASCII 以外の文字ごとに、そのバイト範囲（始まりと終わり）と、始まりの
		UTF-16 の位置を並べた表です。ASCII だけの文書では、この表は空です。ASCII では 1 バイトが UTF-16 の
		1 単位なので、バイト位置をそのまま返せるからです。
	</p>
	<p>
		検証用のソースファイル集は、公式ツールの出力と比べる、実在する Svelte ファイルの集まりです。その <code
			>corpus/svelte</code
		>
		では、19,503 文書のうち 18,419 文書（94%）が ASCII だけで、この近道を通ります<Note
			>コミット <code>7a09c5b1f1</code> の時点の各検証例の <code>input.svelte</code> で、全バイトが 0x80
			未満かを数えました。</Note
		>。
	</p>
</div>

<Code item={data.code.wide} />
<Code item={data.code.indexNew} mark={['is_ascii']} />

<div class="prose-learn">
	<p>
		<code>LineIndex</code>
		はテキストを持ちません。どの問い合わせにも、三つの表と文書の長さだけで答えます。三つの表は、行の先頭の表、改行が
		1 バイトでない行（<code>\r\n</code> など）の表、<code>wide</code> です。
	</p>
</div>

<div class="prose-learn">
	<H2 id="utf16" />
	<p>
		<code>utf16(byte)</code> は、<code>byte</code> までに終わる最後の非 ASCII 文字を、<code
			>wide</code
		>
		から二分探索で探します。その後には ASCII だけが続くので、バイトの差をそのまま足します。<code
			>byte</code
		> が多バイト文字の途中なら、その文字の始まりの位置を返します。文書の終わりを越えていれば、終わりの位置を返します。
	</p>
</div>

<Code item={data.code.utf16} />

<div class="prose-learn">
	<p>
		以前の <code>utf16</code>
		はテキストを受け取り、直前の文字をデコードしてその長さを引いていました。そのため、呼び出し側が別のテキストを渡す間違いが起こりえました。多バイト文字の途中の位置（<code
			>utf16("é", 1)</code
		>）を渡すと、引き算があふれました。debug ビルドでは panic し、release
		ビルドでは巨大な列になりました。
	</p>
	<p>
		この道は、出力の位置から元の位置を引く <code>Emitter::lookup</code>（<a
			href="/learn/kernel/emitter">10 章</a
		>）から到達できました。そこで、表だけで答える形に書き直しました。次のテストは、文字の途中の位置が文字の始まりに丸められることを確かめます。別のテストは、混ざったテキストを先頭から歩き、すべての境目で歩いた結果と一致すること、逆向きにも戻ることを確かめます。
	</p>
</div>

<Code item={data.code.roundTest} />

<div class="prose-learn">
	<p>
		書き直しの費用は、表の要素が <code>u32</code> 2 つ（8 バイト）から 3 つ（12
		バイト）に増えた分です。書き直した変更（コミット <code>91fec70a6d</code>）では、1 ラウンド（<a
			href="/learn/measure#counters">14 章</a
		>の、全ファイルを一度通す計測）あたりの確保バイト数が 11,808
		増えました。割り当て回数と命令数は変わりませんでした。
	</p>

	<DeepDive title="なぜ文字数ではなく UTF-16 なのか">
		<p>
			JavaScript の文字列は UTF-16 で、<code>"😀".length</code> は 2 です。ESLint の
			<code>column</code>
			も、TypeScript の <code>character</code> も、source map の列も、この単位で数えます。Rust の
			<code>char</code>（Unicode
			スカラー値）で数えると、絵文字や一部の漢字を含む行で、公式ツールと位置がずれます。ずれる漢字は、中国語・日本語・韓国語の統合漢字の拡張
			B 以降です。
		</p>
		<p>
			いまのコード検査の出力は列を 1 から数え（<code>column + 1</code>）、型検査の出力は 0
			から数えます。どちらも <code>LineColumn</code> の <code>column</code> から作ります。
		</p>
	</DeepDive>

	<H2 id="offset" />
	<p>
		逆向きの <code>offset(line, column)</code> も表の二分探索です。行の先頭の UTF-16 の位置に列を足して、目標の位置を作ります。その位置より前で終わる最後の非
		ASCII 文字を探し、そこから ASCII の分だけバイトを進めます。
	</p>
</div>

<Code item={data.code.offset} />

<div class="prose-learn">
	<p>
		列は行末（改行の直前）まで受け付けます。行末を越える列と、サロゲートペアの内側を指す列には <code
			>None</code
		> を返します。近くの実在する位置に丸めると、その位置が実在したかを呼び出し側が区別できないからです。図の下の段で、1
		行目に大きな列を入れると確かめられます。
	</p>
	<p>
		型検査は、TypeScript の API が返す診断の行と列を、この <code>offset</code>
		でバイト位置に変えます。<code>None</code>
		になった診断は元の位置を持たないので、その文書の結果をエラーにします。
	</p>
</div>

<Code item={data.code.located} mark={['lines[file].offset(p.line + 1, p.character)']} />

<ChapterFooter chapter={c} />
