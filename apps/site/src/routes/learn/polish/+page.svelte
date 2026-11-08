<script lang="ts">
	import ChapterFooter from '#lib/components/ChapterFooter.svelte';
	import ChapterHeader from '#lib/components/ChapterHeader.svelte';
	import Code from '#lib/components/Code.svelte';
	import H2 from '#lib/components/H2.svelte';
	import Note from '#lib/components/Note.svelte';
	import { chapter } from '#lib/site.ts';

	let { data } = $props();
	const c = chapter('polish');

	type Status = 'fixed' | 'docs' | 'upstream' | 'measured' | 'open';
	const label: Record<Status, string> = {
		fixed: '直した',
		docs: '文書を直した',
		upstream: '公式ツールどおり',
		measured: '測って見送り',
		open: '未着手',
	};
	const ms = (v: number) => v.toFixed(1);
	const fmt = (n: number) => n.toLocaleString('en-US');
	const delta = (now: number | null, was: number | null | undefined) =>
		now === null || was === null || was === undefined || now === was
			? ''
			: `${now > was ? '+' : '−'}${(Math.abs(now / was - 1) * 100).toFixed(1)}%`;
	const { rows, last: lastRec, firstInstr } = $derived(data.history);
</script>

<svelte:head><title>{c.title} — rsvelte 開発者向けの教材</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="性能の基準値が記録してきた最適化の推移と、カーネルを読んで見つけた問題の一覧です。見送った問題には、その理由を書いています。"
/>

{#snippet item(n: string, title: string, status: Status, where: string)}
	<h3 class="mt-12 flex flex-wrap items-baseline gap-x-3 text-[19px] leading-[1.55] font-semibold">
		<span class="font-mono text-[13px] font-normal tracking-normal text-muted">{n}</span>{title}
		<span
			class={[
				'rounded-xs border px-1.5 font-mono text-[11.5px] font-normal tracking-normal',
				status === 'open' ? 'border-accent text-accent' : 'border-line-strong text-fg-2',
			]}>{label[status]}</span
		>
	</h3>
	<p class="mt-1 font-mono text-[12px] tracking-normal text-muted">{where}</p>
{/snippet}

<div class="prose-learn">
	<H2 id="history" />
	<p>
		<code>tools/performance/baseline.json</code>
		を書き換えたコミットを古い順に並べ、それぞれが記録した値を示します（<a
			href="/learn/measure#ratchet">14 章</a
		>）。値はビルドのたびに git の履歴から読みます（<code>src/lib/build/performance-history.ts</code
		>）。コミットしていない基準値の変更があれば、最後に「作業ツリー」の行が付きます。命令数は、arm64
		Linux の cachegrind で数えた 1 ラウンド（すべての文書を一回処理する分、<a href="/learn/measure"
			>14 章</a
		>）の値です。
	</p>
	<p>
		測る文書とタスクは途中で何度も変わったので、離れた行の値はそのまま比べられません。文書、タスク、数え方がどれも今と同じ最初の行は
		{firstInstr.sha ?? '作業ツリー'} で、そこから命令数は {fmt(firstInstr.instructions!)} から {fmt(
			lastRec.instructions!,
		)} に変わりました（{delta(lastRec.instructions, firstInstr.instructions)}）。
	</p>
	<p>
		表の「読み込み」は、起動から文書を作るまでの命令数です。読み込みを初めて記録したのは、コミット <code
			>a5822ee26f</code
		>
		です。この変更自身が、読み込みを 878,552,187 命令から 345,682,955 命令に減らしました（コミットのメッセージによる）。コミット
		<code>201b86fd6b</code>
		の行で読み込みが減ったのは、最適化ではなく測り方の訂正です（<a href="/learn/measure#ci">14 章</a
		>）。
	</p>
</div>

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table min-w-[760px]">
		<thead>
			<tr>
				<th>コミット</th>
				<th class="w-[18%]">命令数</th>
				<th class="num"></th>
				<th class="num">割り当て</th>
				<th class="num">バイト</th>
				<th class="num">読み込み</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as r (r.sha ?? 'working-tree')}
				{@const prev = r.prev}
				<tr>
					<td
						><code>{r.sha ?? '作業ツリー'}</code>
						<div class="text-[13px] text-muted" lang="en">{r.subject}</div></td
					>
					<td class="align-middle">
						{#if r.instructions !== null}
							<div class="h-2 bg-surface">
								<div class="h-2 bg-fg" style:width="{r.instructionsWidth * 100}%"></div>
							</div>
						{/if}
					</td>
					<td class="num">
						{r.instructions === null ? '—' : fmt(r.instructions)}
						<div class="text-[12px] text-muted">{delta(r.instructions, r.instructionsWas)}</div>
					</td>
					<td class="num"
						>{fmt(r.allocations)}
						<div class="text-[12px] text-muted">{delta(r.allocations, prev?.allocations)}</div></td
					>
					<td class="num"
						>{fmt(r.alloc_bytes)}
						<div class="text-[12px] text-muted">{delta(r.alloc_bytes, prev?.alloc_bytes)}</div></td
					>
					<td class="num">
						{r.load_instructions === null ? '—' : fmt(r.load_instructions)}
						<div class="text-[12px] text-muted">{delta(r.load_instructions, r.loadWas)}</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		差は直前の行との比で、—
		はまだ数えていなかった量です。測る文書やタスクが変わった行では、差の大きさは最適化を表しません。<code
			>b58a0a72be</code
		>
		で文書が 1 つ（<code>minimal/emoji-width.svelte</code>）増えました。<code>9226b2278b</code> から
		<code>575a859c4d</code>
		までは、svue と vuelte のタスクを足したブランチの行です。svue は Vue のファイルを Svelte のコンパイラで処理し、vuelte
		は Svelte のファイルを Vue Vapor に変換します。<code>4f1751ba18</code>
		はそのブランチを取り込む前の本流の行で、二つは <code>8465bdb16f</code> で合流します。<code
			>ea7a2bc61d</code
		>
		では文書が 18,137 から 20,108 に増え、TypeScript のタスクも加わりました。<code>df738ee9b8</code>
		からの命令数は、名前順に並べた文書を一定の間隔で選んで数えた値です（今は {lastRec.instruction_sample}
		個に 1 個）。自動検査の時間を縮めるためです。数え方が変わった行（<code>df738ee9b8</code> と
		<code>c88eebba2f</code>）では、前の行と比べられないので差を出していません。
	</figcaption>
</figure>

<div class="prose-learn">
	<p>
		大きく動いた変更とその仕組みです。数は各コミットのメッセージからの引用で、どれも 1
		ラウンドあたりです。
	</p>
	<ul>
		<li>
			<strong>句読点の字句解析</strong>（コミット <code>49aeb2de94</code>、命令数 −29.4%）。
			以前の字句解析器は、58 個の演算子を順に <code>starts_with</code>
			で試していました。一致したら、そのテキストを種類に照合します。1 ラウンドで 4,000 万回の
			<code>memcmp</code> で、全命令の 13% でした。今は最初のバイトで分岐し、続くバイトを見て最長の句読点を決めます。
		</li>
	</ul>
</div>

<Code item={data.code.punct} />

<div class="prose-learn">
	<p>
		テストは古い演算子の表を正解として残します。演算子に使う文字でできた 4
		バイトまでのすべての文字列で、分岐の答えが表と一致するかを確かめます。
	</p>
</div>

<Code item={data.code.punctTest} />

<div class="prose-learn">
	<ul>
		<li>
			<strong>改行の要否をノードを作るときに計算</strong>（コミット <code>708a4403d5</code>、命令数
			−4.07%）。
			<code>will_break</code> を表引きにしました。出力の前に木をたどる
			<code>propagate_breaks</code>
			とそのメモは消しました。アリーナのバッファもプールから借ります。<code>svelte.format</code>
			の割り当ては 1,070,011 回から 691,547 回に減りました（<a
				href="/learn/document-printer#printer">09 章</a
			>）。
		</li>
		<li>
			<strong>読み込み</strong>（コミット <code>a5822ee26f</code>、読み込みの命令数 −60.7%）。
			読み込みの大半は
			<code>Path</code>
			の解析でした。検証用のソースファイル集（公式ツールの出力と比べる、実在するファイルの集まり）は、ファイルを一つずつ検証例として読みます。その検証例を並べ替えるたびに、パスの部品を比べていました。さらに各検証例が祖先をたどり、管理用のディレクトリ
			<code>_registry/</code>
			を探して（一段ごとに
			<code>stat</code
			>）、接頭辞を取り除いていました。今は各ディレクトリの項目を名前順に深さ優先でたどるので、並べ替えなしで
			<code>Path::cmp</code>
			の順に出てきます。深さとソースからの相対パスは走査の途中で受け渡し、項目の種類は
			<code>stat</code> を使わずにディレクトリから読みます。
		</li>
		<li>
			<strong>トークン表とテンプレートの列をプールに</strong>（コミット
			<code>92571ee562</code>、バイト −45%）。
			<a href="/learn/kernel/buffer-pool#users">13 章</a>を参照。
		</li>
		<li>
			<strong>構文解析のリストを一本のスタックに</strong>（コミット
			<code>d5060ddc01</code>、割り当て −8.1%）。
			以前は、文や引数などのリストごとに配列を作り、構文木にコピーしていました。そのため 1
			ラウンドで 23.5 万回の割り当てがありました。今は <code>SyntaxTree</code>
			が持つ一本のスタックに積みます。リストは入れ子になるので、最後に開いたリストが常に一番上にあります。閉じるときは、スタックの上から要素を作って取り除きます。成功した構文解析がすべてのリストを閉じたかは、debug
			ビルドで確かめます。
		</li>
	</ul>
</div>

<Code item={data.code.parserClose} />

<div class="prose-learn">
	<ul>
		<li>
			<strong>プールの鍵を持ち主ごとに</strong>（コミット <code>20f5846343</code>、割り当て
			−6.7%）。
			<a href="/learn/kernel/buffer-pool#keyed">13 章</a>を参照。
		</li>
		<li>
			<strong>埋め込み言語へのトークンの受け渡し</strong>（コミット <code>ff65a1e66b</code>、バイト
			−19%）。
			以前は、テンプレートの式ごとにトークンとコメントをベクタに集めて渡していました。どちらも
			JavaScript のパーサが記録したものです。この量は 1 ラウンドで 36 メガバイト、全確保バイトの 5
			分の 1 でした。今は両方をイテレータで位置の順に合流させながら渡します。
		</li>
	</ul>
</div>

<Code item={data.code.recorded} />

<div class="prose-learn">
	<ul>
		<li>
			<strong>テンプレートのリストを集めずに読む</strong>（コミット
			<code>7908907666</code>、割り当て −7.6%）。
			属性とその断片は入れ子にならないので、コンポーネントの列に直接積みます。範囲は積む前後の長さで決まります。子は入れ子になるので一本のスタックに集め、断片が閉じたときに
			<code>children</code> へ移します。
		</li>
		<li>
			<strong>整形器に行の索引を渡す</strong>（コミット <code>42b6e550e1</code>、命令数 −1.5%）。
			行の索引は文書ごとに一つ作り、コード検査が使っていました。今は Svelte と Vue
			の整形器も同じ索引を受け取ります（<a href="/learn/kernel/database#attribution">04 章</a>）。
		</li>
		<li>
			<strong>整形器がコンポーネントの中身を複製しない</strong>（コミット
			<code>e0ef873545</code>、割り当て −7.8%）。
			以前は借用の都合で、要素の子、属性の断片、テキストを複製していました。今はコンポーネントの寿命で借用します（<a
				href="/learn/document-printer#ir">09 章</a
			>）。
		</li>
		<li>
			<strong>JSON の文字列を連続部分ごとにコピー</strong>（コミット <code>a6eed170c4</code>、命令数
			−0.6%）。
			<a href="/learn/kernel/structured-data#escape">11 章</a>を参照。
		</li>
	</ul>
	<p>
		命令数が増えた変更もあります。文字幅を Prettier と同じ表で計算する変更（<code>b58a0a72be</code
		>）は +0.22% でした。識別番号の空き値を使う変更（<code>36c3539efb</code>）は +0.08%
		でした。スレッドのプールが持つメモリに上限を設ける変更（<code>e8eef831d3</code>）も +0.22%
		です。どれも、正しさかメモリ使用量の上限を守るための変更です。
	</p>

	<H2 id="correctness" />
	<p>
		ここからは、カーネルを読んで見つけた問題です。番号の頭文字は節を表します（P は正しさ、C
		は守るべき条件と文書、F は性能、M
		は計測）。見出しの横のラベルは、その問題の扱いです。「公式ツールどおり」は、公式ツールと同じ動きなので残したものです。公式ツールは、rsvelte
		が出力を比べる Prettier
		などの公式の実装を指します。「測って見送り」は測った結果直さなかったもの、「文書を直した」はドキュメントだけを直したものです。
	</p>

	{@render item(
		'P1',
		'書き出す source map と lookup の答えが違った',
		'fixed',
		'output/emitter.rs · Emitter::source_map、Emitter::lookup',
	)}
	<p>
		source map
		は、生成したコードの位置を元のソースの位置に対応させる表で、対応の各項目をセグメントと呼びます。<code
			>lookup</code
		>
		は同じ対応を rsvelte の中で引く関数です。以前の <code>source_map</code>
		は、コピーした範囲（<code>Mapping</code>）一つにつきセグメントを一つだけ書いていました。そのため
		source map
		の読み手には、コピーの内側がすべてコピーの先頭に写っていました。今はコピーの文字ごとにセグメントを書き、<code
			>lookup</code
		>
		も読み手と同じく「同じ生成行で」探します。テストは書き出した source map を復号し、出力のすべての位置で二つの答えを比べます（<a
			href="/learn/kernel/emitter#disagreement">10 章</a
		>）。
	</p>
	<p>直す途中で、同じ場所に欠陥がさらに三つ見つかりました。</p>
	<ul>
		<li>複数行にまたがるコピーは、二行目以降にセグメントがなく、写らなかった。</li>
		<li>
			コピーの後の挿入テキストを引くと、最後の文字が多バイトのとき、文字の途中のバイトを返していた。
		</li>
		<li>
			型検査のタスクは、tsc に渡すテキストを Emitter から抜き取っていた。そのため、その後の <code
				>lookup</code
			>
			は空のテキストを相手にしていた。以前の <code>lookup</code> はテキストを読まなかったので、表に出ていなかった。
		</li>
	</ul>
	<p>
		変更の前後で検証用のソースファイル集の全出力を比べると、コンパイル、コード検査、型検査の出力は 1
		バイトも変わりませんでした<Note
			>変更前と変更後のバイナリで <code>rsvelte fixtures</code> を走らせ、<code>actual/</code> の全ファイルのハッシュを突き合わせました。整形の診断ファイルは変わりましたが、これは同時に入れた別の変更（下の
			C3）によるものです。</Note
		>。
	</p>

	{@render item(
		'P2',
		'LineIndex::offset が存在しない列を丸めていた',
		'fixed',
		'source/positions.rs · LineIndex::offset',
	)}
	<p>
		今の <code>offset</code> は、行末を越える列と、サロゲートペアの内側を指す列に <code>None</code>
		を返します。丸めに頼っていた呼び出し側は、tsc のレポートの解析だけでした。tsc は行末にある幅 0 の範囲を、行末より一列先の位置として報告します。この列も
		<code>None</code>
		になるので、この場合だけ解析の側で行末に戻します。tsc 7.0.2 の実際の出力で確かめました（<a
			href="/learn/kernel/source#offset">02 章</a
		>）。
	</p>

	{@render item(
		'P3',
		'範囲の検査が debug ビルドだけだった',
		'fixed',
		'output/emitter.rs · Edits::apply_in、lint/rule.rs · Reporter、check/report.rs · parse_report',
	)}
	<p>
		<code>Edits</code>（出力に加える書き換えの一覧）の重なりと範囲は、release
		ビルドでも確かめます。コード検査のルールは指摘の識別名を自分で書きません。<code>Reporter</code>
		が付けるので、別の名前では報告できません。<code>Span::new</code> は
		<code>debug_assert!</code> のままです。パーサが読んだテキストから Span を作る、一番よく通る道だからです。その代わり、外から来た位置（tsc
		のレポート）は、Span を作る前に解析の側で確かめます。
	</p>

	{@render item(
		'P4',
		'LayoutInstruction のアリーナが書き換えられる',
		'upstream',
		'document_printer · LayoutInstructions::trim_left、trim_right、replace_parts',
	)}
</div>

<Code item={data.code.trimLeft} mark={['self.replace_parts(d, &inner);']} />

<div class="prose-learn">
	<p>
		<code>trim</code>
		は既存のノードの子リストを差し替えます。同じノードを二か所で使っていると、片方の
		<code>trim</code> がもう片方も変えます。公式ツールの prettier-plugin-svelte の
		<code>trimLeft</code>
		も、<code>getParts</code> が返した配列を <code>splice</code> でその場で書き換えます<Note
			>prettier-plugin-svelte 4.1.1 の <code>plugin.js</code> で確かめました。</Note
		>。新しいノードを返す形にすると、ノードを共有したときの出力が公式ツールと違うので、直していません。
	</p>

	{@render item(
		'P5',
		'panic のメッセージが空になることがあった',
		'fixed',
		'computation/pipeline.rs · panic_message',
	)}
	<p>
		panic に渡された値が文字列でないときは、空文字列の代わりに決まった文を入れます（<a
			href="/learn/kernel/pipeline#run-document">06 章</a
		>）。
	</p>

	{@render item(
		'P6',
		'LineIndex::utf16 が多バイト文字の途中で桁あふれした',
		'fixed',
		'source/positions.rs · LineIndex',
	)}
	<p>
		以前の <code>utf16</code>
		は、直前の文字を読んでその長さを引いていました。多バイト文字の途中を指すと、この引き算があふれます。たとえば
		<code>utf16("é", 1)</code> です。debug ビルドでは panic し、release
		ビルドでは巨大な列番号を返していました。今は多バイト文字ごとにバイト範囲と UTF-16
		の位置を表に持ち、二分探索で答えます（<a href="/learn/kernel/source#utf16">02 章</a>）。
	</p>

	{@render item(
		'P7',
		'shouldBreak の group が親の group を壊さなかった',
		'fixed',
		'document_printer · LayoutInstructions::push',
	)}
	<p>
		最初から改行すると決めた group（<code>group_broken</code>。Prettier の
		<code>shouldBreak</code>）が、親の group を改行させていませんでした。そのため Prettier
		と違う出力になっていました（<a href="/learn/document-printer#printer">09 章</a>）。
	</p>

	{@render item(
		'P8',
		'絵文字やゼロ幅の文字の幅を数え違えた',
		'fixed',
		'document_printer · string_width',
	)}
	<p>
		以前は、絵文字、異体字セレクタ、ゼロ幅の文字の幅を数え違えていました。一度 Prettier
		の表に合わせたあと、今は Unicode の幅の規則（unicode-width crate）で数えます。Prettier
		の表との完全な一致は目的にしていません（<a href="/learn/document-printer#flat-only">09 章</a
		>）。
	</p>

	{@render item(
		'P9',
		'JSON の数値を書く関数が、数値でない文字列も受け付けた',
		'fixed',
		'output/structured_data.rs · StructuredDataWriter::write_number、fixed',
	)}
	<p>
		整数と小数を別の関数に分け、有限でない小数は <code>null</code> にしました（<a
			href="/learn/kernel/structured-data#state">11 章</a
		>）。
	</p>

	<H2 id="contracts" />

	{@render item(
		'C1',
		'Task::identifier のドキュメントの例が実際の名前と違った',
		'fixed',
		'computation/pipeline.rs · Task::identifier',
	)}
	<p>
		実際の形 <code>&lt;言語&gt;.&lt;タスク&gt;/&lt;変種&gt;</code> と例（<code
			>svelte.compile/client</code
		>）に直しました。この例は、その後ドキュメントを書き直したときに消えました。今のドキュメントは「タスクの選択と計測に使う名前」とだけ書き、名前の形を決めていません。
	</p>

	{@render item(
		'C2',
		'知らないタスク名を黙って無視していた',
		'fixed',
		'computation/pipeline.rs · Registry::check_task_identifiers、run_each',
	)}
	<p>
		<code>run_each</code> と <code>run</code> は、知らないタスク名があれば何も走らせずに
		<code>Err(UnknownTask)</code> を返します。CLI も同じ関数で確かめます（<a
			href="/learn/kernel/pipeline#registry">06 章</a
		>）。
	</p>

	{@render item(
		'C3',
		'Unsupported が場所を持たなかった',
		'fixed',
		'diagnostics/diagnostic.rs · Unsupported',
	)}
	<p>
		<code>Unsupported</code> は、拒否した構文の
		<code>SourceLocation</code
		>（元のソースでの位置）を持ちます。整形の診断と、型検査用のコード生成の診断は、その構文を指します。位置を持たないのは文書全体についての判断（一行に収まらないレイアウト）だけで、それは
		<code>Unsupported::nowhere</code>
		で作ります。CSS の整形も同じ型に揃えました（<a href="/learn/kernel/diagnostics#unsupported"
			>07 章</a
		>）。
	</p>

	<H2 id="performance" />

	{@render item(
		'F1',
		'フェーズの行を名前の線形探索で探す',
		'measured',
		'performance/measurement.rs · PhaseGuard::drop',
	)}
	<p>
		フェーズのガード（区間の時間を測る値）一回の時間をマイクロベンチで測ると、およそ半分は計時のための二回の時計読みでした。表のロックと探索を多めに見積もって呼び出し回数を掛けても、計測を有効にした
		metrics ビルドの時間の 1% に届きません。番号で引く形は構造が複雑になるので見送りました。
	</p>

	{@render item(
		'F2',
		'プロジェクト全体の処理の前処理がタスク数 × 文書数だった',
		'open',
		'computation/pipeline.rs · run_finish_tasks',
	)}
	<p>
		プロジェクトタスクは、全文書を見てから一度だけ走るタスク（型検査など）です。文書ごとの処理は、プロジェクトタスクに渡す部品を残します。部品は、一度の走査でプロジェクトタスクごとに振り分けるように直しました。ただし、全文書の出力を借りる表は、部品を持つプロジェクトタスクごとに作り直します。そのため全体の手間は、今も「部品を持つプロジェクトタスクの数
		× 全文書の出力の数」です。関数のコメントにこの手間を書きましたが、残りはまだ直していません（<a
			href="/learn/kernel/pipeline#project">06 章</a
		>）。
	</p>

	{@render item(
		'F3',
		'プロジェクト全体の処理を待つ文書が、全タスクの出力を抱える',
		'open',
		'computation/pipeline.rs · run_each',
	)}
</div>

<Code item={data.code.runEach} mark={['.push((i, r));']} />

<div class="prose-learn">
	<p>
		部品を持つ文書は、<code>DocumentResult</code> ごと待機リストに入ります。そのため、同じ文書の compile
		や format の出力も、型検査が終わるまで解放されません。直すには、文書の結果を「確定した出力」と「プロジェクト全体の処理を待つ出力」に分け、前者を先に
		sink（文書の結果を受け取る呼び出し側の関数）へ渡します。すると sink の守るべき条件（一文書に一回）が変わるので、まだ直していません。
	</p>

	{@render item(
		'F4',
		'pool とスレッドの小さな無駄',
		'fixed',
		'performance/buffer_pool.rs · take、computation/pipeline.rs · in_pool、run_document',
	)}
	<ul>
		<li>
			<code>RunOptions::threads</code> を指定した実行は、毎回新しいスレッドプールを作っていました。今は最後に使ったスレッド数のプールを一つ、プロセスのあいだ残します。
		</li>
		<li>
			<code>Sharing::Isolated</code>
			は、タスクどうしで計算結果を共有しない設定です。この設定でも、使わない <code>shared</code> の
			<code>DocumentContext</code
			>（文書ごとの計算結果を持つ型）を作っていました。今は、初めて使うときに作ります。
		</li>
		<li>
			<span class="text-accent">未着手</span>：<code>take</code>
			は後入れ先出しなので、大きな文書に小さなバッファを渡すことがあります。<code>take</code>
			は必要な大きさを知りません。選び方を変えるなら、呼び出し側が大きさの見込みを渡す形になります。効果をまだ測っていないので、変えていません。
		</li>
	</ul>
</div>

<Code item={data.code.take} />

<div class="prose-learn">
	{@render item(
		'F5',
		'Interner がヒットでもテーブルを拡張した',
		'fixed',
		'source/interning.rs · Interner::intern',
	)}
	<p>
		テーブルを広げるかの判定は、名前が見つからなかったときだけ行います（<a
			href="/learn/kernel/interning#growth">03 章</a
		>）。
	</p>

	{@render item(
		'F6',
		'run が文書ごとにロックを取っていた',
		'fixed',
		'computation/pipeline.rs · run',
	)}
	<p>
		macOS の <code>Mutex</code> は最初のロックで割り当てをし、Linux の <code>Mutex</code>
		はしません。そのため割り当て回数が、文書ごとに 1 回ずつ二つの環境で違っていました。今は結果を rayon
		の <code>collect</code> で順に集めるので、どちらも同じ回数です（<a
			href="/learn/kernel/pipeline#run">06 章</a
		>）。
	</p>

	<h3 class="mt-12 text-[19px] leading-[1.55] font-semibold">性能への影響</h3>
	<p>
		F2 の振り分け、F4 の二つの修正、F5
		は性能の修正です。それでも、検証用のソースファイル集全体の時間は動きませんでした。表は、同じソースファイル集（{data.polish.documents.toLocaleString(
			'en-US',
		)} 文書）を変更前、変更後、変更後、変更前の順に走らせた中央値です（ms、計測を入れない plain ビルド）。測定条件は
		rsvelte 自身の実行設定で、他のツールではありません。<code>shared</code> と <code>isolated</code>
		は、タスクどうしで計算結果を共有するかどうかの違いです。<code>nopool</code>
		はバッファのプールを使わない実行、<code>serial</code> は 1 スレッドの実行です。<code
			>streaming</code
		> は、結果を文書ごとに受け取る実行です。
	</p>
	<div class="overflow-x-auto">
		<table class="table">
			<thead>
				<tr
					><th>測定条件</th><th class="num">変更前（1 回目と 2 回目）</th><th class="num"
						>変更後（1 回目と 2 回目）</th
					></tr
				>
			</thead>
			<tbody>
				{#each data.polish.arms as a (a.name)}
					<tr>
						<td><code>{a.name}</code></td>
						<td class="num">{ms(a.before[0])}、{ms(a.before[1])}</td>
						<td class="num">{ms(a.after[0])}、{ms(a.after[1])}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p>
		変更の前後の差は、同じ測定条件を二回測ったときの揺れより小さいので、速さが変わったとは言えません。スレッド数を指定する測定条件は
		<code>serial</code> だけで、以前は毎回スレッドプールを作り直していました。プールを残しても
		<code>serial</code>
		が変わらないので、作り直しのコストは無視できる大きさだったことも分かります<Note
			>計測の時間帯には Spotlight
			の索引作成が動いていました。前後を交互に並べたのは、その揺れを変更前と変更後に等しく乗せるためです。</Note
		>。
	</p>

	<H2 id="measurement" />

	{@render item(
		'M1',
		'ピークは増分で、負の生存量を 0 に丸める',
		'docs',
		'performance/measurement.rs · GlobalMeasurements',
	)}
	<p>
		<code>peak_live_growth</code>
		のドキュメントに、二つのことを書きました。追跡を始める前に確保したメモリは入りません。そのメモリを解放すると生存量が負になり、「増えていない」と読めます。
	</p>

	{@render item(
		'M2',
		'フェーズの self はスレッド時間の合計',
		'docs',
		'performance/measurement.rs · PhaseMeasurements',
	)}
	<p>
		<code>PhaseMeasurements</code>
		の時間は、フェーズを走らせたスレッドで測った経過時間を、全スレッドについて足したものです。待っている時間も入るので
		CPU 時間とは違い、10 スレッドなら 10 倍に数えるので全体の経過時間とも違います。そこで、割合として読むようにドキュメントに書きました。
	</p>

	{@render item(
		'M3',
		'フェーズのガードを別のスレッドで落とせた',
		'fixed',
		'performance/measurement.rs · PhaseGuard',
	)}
	<p>
		ガードは <code>Send</code>
		でない型になり、別のスレッドへ渡せなくなりました。順番を違えて落とすと debug ビルドで止まります。同じ変更で、<code
			>CountingAllocator</code
		>（割り当てを数えるアロケータ）は
		<code>alloc_zeroed</code>
		をシステムへそのまま渡します（<a href="/learn/kernel/measurement#phases">12 章</a>）。
	</p>

	{@render item(
		'M4',
		'命令数の基準値を作業ツリーのテスト用の入力と期待値で測っていた',
		'fixed',
		'tools/performance/linux.ts',
	)}
	<p>
		以前は、作業ツリーに残ったローカルの出力（<code>actual/</code
		>）まで読み込みで数えていました。今は、ステージしたテスト用の入力と期待値をスナップショットにして測ります（<a
			href="/learn/measure#ci">14 章</a
		>）。
	</p>
</div>

<ChapterFooter chapter={c} />
