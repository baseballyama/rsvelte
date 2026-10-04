<script lang="ts">
	import Term from '$lib/components/Term.svelte';
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';

	let { data } = $props();
	const c = chapter('polish');

	type Status = 'fixed' | 'docs' | 'upstream' | 'measured' | 'open';
	const label: Record<Status, string> = {
		fixed: '直した',
		docs: '文書を直した',
		upstream: '上流どおり',
		measured: '測って見送り',
		open: '未着手'
	};
	const ms = (v: number) => v.toFixed(1);
	const fmt = (n: number) => n.toLocaleString('en-US');
	const delta = (now: number | null, was: number | null | undefined) =>
		now === null || was === null || was === undefined || now === was ? '' : `${now > was ? '+' : '−'}${(Math.abs(now / was - 1) * 100).toFixed(1)}%`;
	const firstInstr = $derived(data.history.find((r) => r.instructions !== null)!);
	const lastRec = $derived(data.history.at(-1)!);
	const firstLoad = $derived(data.history.find((r) => r.load_instructions !== null)!);
	const maxInstr = $derived(Math.max(...data.history.map((r) => r.instructions ?? 0)));
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="性能の基準値との比較検査が記録してきた最適化の推移と、カーネルを読んで見つけた直す価値のある箇所の一覧です。直したものは各章の説明もその実装に合わせてあります。直さなかったものには、直さなかった理由を書いています。"
/>

{#snippet item(n: string, title: string, status: Status, where: string)}
	<h3 class="mt-12 flex flex-wrap items-baseline gap-x-3 text-[19px] leading-[1.55] font-semibold">
		<span class="font-mono text-[13px] font-normal tracking-normal text-muted">{n}</span>{title}
		<span
			class={[
				'rounded-xs border px-1.5 font-mono text-[11.5px] font-normal tracking-normal',
				status === 'open' ? 'border-accent text-accent' : 'border-line-strong text-fg-2'
			]}>{label[status]}</span
		>
	</h3>
	<p class="mt-1 font-mono text-[12px] tracking-normal text-muted">{where}</p>
{/snippet}

<div class="prose-learn">
	<H2 id="history" />
	<p>
		<code>tools/performance/baseline.json</code> を書き換えたコミットを古い順に並べ、それぞれが記録した値を示します（<a href="/learn/measure#ratchet">13</a
		>）。値はビルドのたびに git の履歴から読み出します（<code>src/lib/build/performance-history.ts</code>）。基準値を書き換えてまだコミットしていなければ、その値が「作業ツリー」の行として最後に付きます。命令数は
		arm64 Linux の cachegrind で数えた 1 ラウンドの分です。
	</p>
	<p>
		命令数を初めて記録した <code>{firstInstr.sha ?? "作業ツリー"}</code> の {fmt(firstInstr.instructions!)} から、今の {fmt(lastRec.instructions!)} へ（{delta(
			lastRec.instructions,
			firstInstr.instructions
		)}）。割り当ては最初の {fmt(data.history[0].allocations)} 回から {fmt(lastRec.allocations)} 回へ（{delta(lastRec.allocations, data.history[0].allocations)}）、割り当てバイトは
		{fmt(data.history[0].alloc_bytes)} から {fmt(lastRec.alloc_bytes)} へ（{delta(lastRec.alloc_bytes, data.history[0].alloc_bytes)}）。読み込みの命令数は、記録を始めた
		<code>{firstLoad.sha ?? "作業ツリー"}</code> の {fmt(firstLoad.load_instructions!)} から {fmt(lastRec.load_instructions!)} です。ただし読み込みを記録し始めたのは、読み込みを
		878,552,187 命令から減らした変更そのもので（コミットのメッセージによる）、<code>{firstLoad.sha ?? "作業ツリー"}</code> の行の読み込みの減少は最適化ではなく測り方の訂正です（<a
			href="/learn/measure#ci">13</a
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
			{#each data.history as r, i (r.sha ?? "working-tree")}
				{@const prev = data.history[i - 1]}
				<tr>
					<td><code>{r.sha ?? "作業ツリー"}</code><div class="text-[13px] text-muted" lang="en">{r.subject}</div></td>
					<td class="align-middle">
						{#if r.instructions !== null}
							<div class="h-2 bg-surface"><div class="h-2 bg-fg" style:width="{(r.instructions / maxInstr) * 100}%"></div></div>
						{/if}
					</td>
					<td class="num">
						{r.instructions === null ? '—' : fmt(r.instructions)}
						<div class="text-[12px] text-muted">{delta(r.instructions, prev?.instructions)}</div>
					</td>
					<td class="num">{fmt(r.allocations)}<div class="text-[12px] text-muted">{delta(r.allocations, prev?.allocations)}</div></td>
					<td class="num">{fmt(r.alloc_bytes)}<div class="text-[12px] text-muted">{delta(r.alloc_bytes, prev?.alloc_bytes)}</div></td>
					<td class="num">
						{r.load_instructions === null ? '—' : fmt(r.load_instructions)}
						<div class="text-[12px] text-muted">{delta(r.load_instructions, prev?.load_instructions)}</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		各行はそのコミットの <code>baseline.json</code>。差は直前の行との比。— はまだ数えていなかった量です（命令数を基準値に記録したのは 2 行目から、読み込みは a5822ee26f から）。母集団は
		<code>b58a0a72be</code> で 1 文書増えています（<code>minimal/emoji-width.svelte</code>）。
	</figcaption>
</figure>

<div class="prose-learn">
	<p>表の中で大きく動いた変更と、その仕組みです。数はそれぞれのコミットのメッセージからの引用です。</p>
	<ul>
		<li>
			<strong>句読点の字句解析</strong>（49aeb2de94、命令数 −29.4%）: 字句解析器は 58 個の演算子を順に <code>starts_with</code>
			で試し、勝ったもののテキストを種類に照合していました。1 ラウンドで 4,000 万回の <code>memcmp</code>、全命令の 13% です。今は最初のバイトで分岐し、続くバイトを見て最長の句読点を決めます。
		</li>
	</ul>
</div>

<Code item={data.code.punct} />

<div class="prose-learn">
	<p>
		テストは古い演算子の表を定義として残し、演算子に使われる文字からなる 4 バイトまでのすべての文字列で、分岐の答えが表と一致することを確かめます。
	</p>
</div>

<Code item={data.code.punctTest} />

<div class="prose-learn">
	<ul>
		<li>
			<strong>整形用のデータ構造 の破断を作る時点で計算</strong>（708a4403d5、命令数 −4.07%）: 出力の前の <code>propagate_breaks</code>
			とそのメモを消し、<code>will_break</code> を表引きにしました。アリーナのバッファもプールに入れ、<code>svelte.format</code>
			の割り当ては 1,070,011 回から 691,547 回になりました（<a href="/learn/kernel/document#printer">08</a>）。
		</li>
		<li>
			<strong>読み込み</strong>（a5822ee26f、読み込みの命令数 −60.7%）: 読み込みの大半は <code>Path</code> の解析でした。検証例の並べ替えがパスの部品を比べ、各検証例が
			<code>_registry/</code> を探して祖先をたどり（そのたびに <code>stat</code>）、接頭辞を剥がしていました。今は各ディレクトリの項目を名前の順に深さ優先でたどるので、並べ替えなしで
			<code>Path::cmp</code> の順に出てきます。深さとソースからの相対パスは走査の途中で運び、項目の種類は <code>stat</code> ではなくディレクトリから読みます。
		</li>
		<li>
			<strong>トークン表とテンプレートの列をプールに</strong>（92571ee562、バイト −45%）: <a href="/learn/kernel/buffer-pool#users">12</a> を参照。
		</li>
		<li>
			パーサの作業用配列を一本にまとめました（d5060ddc01、割り当て −8.1%）。
			以前は、文や引数などのリストを別々の配列に集め、構文木にコピーしていました。そのため1回の実行で23.5万回のメモリ割り当てがありました。今は <code>SyntaxTree</code>
			が持つ一本のスタックに積みます。リストは入れ子になるので、最後に開いたものが常に一番上にあり、閉じるときにスタックの上から要素を作って取り除きます。成功したパースが開いたリストをすべて閉じたかは、debug
			ビルドで確かめます。
		</li>
	</ul>
</div>

<Code item={data.code.parserClose} />

<div class="prose-learn">
	<ul>
		<li><strong>プールの鍵を持ち主ごとに</strong>（20f5846343、割り当て −6.7%）: <a href="/learn/kernel/buffer-pool#keyed">12</a> を参照。</li>
		<li>
			<strong>埋め込み言語へのトークンの受け渡し</strong>（ff65a1e66b、バイト −19%）: テンプレートの式ごとに、JavaScript
			のパーサが記録したトークンとコメントをベクタに集めて渡していました。1 ラウンドで 36 メガバイト、全確保バイトの 5 分の 1 です。今はイテレータで順に合流させながら渡します。
		</li>
	</ul>
</div>

<Code item={data.code.recorded} />

<div class="prose-learn">
	<ul>
		<li>
			<strong>テンプレートのリストを集めずに読む</strong>（7908907666、割り当て −7.6%）: 要素の属性と属性の断片は入れ子にならないので、コンポーネントの列に直接積み、前後の長さで範囲を取ります。子は入れ子になるので、一本のスタックに集めて、断片が閉じたときに
			<code>children</code> へ移します。
		</li>
		<li><strong>整形器に行の索引を渡す</strong>（42b6e550e1、命令数 −1.5%）: 文書ごとに一つ作る行の索引を、lint だけでなく Svelte と Vue の整形器も受け取るようにしました（<a href="/learn/kernel/database#attribution">04</a>）。</li>
		<li>
			<strong>整形器がコンポーネントの中身を複製しない</strong>（e0ef873545、割り当て −7.8%）: 借用の都合で要素の子、属性の断片、テキストを複製していたのをやめ、コンポーネントの寿命で借用します（<a
				href="/learn/kernel/document#ir">08</a
			>）。
		</li>
		<li><strong>構造化データ形式の文字列を連続部分ごとにコピー</strong>（a6eed170c4、命令数 −0.6%）: <a href="/learn/kernel/structured-data#escape">10</a> を参照。</li>
	</ul>
	<p>
		命令数が増えた変更もあります。文字幅を公式ツールと同じ表で計算する変更は+0.22%でした（b58a0a72be）。
		識別番号の空き値を使う変更は+0.08%、再利用するメモリの上限を設ける変更は+0.22%でした（36c3539efb、e8eef831d3）。
		どれも正しさやメモリ使用量の上限を守るための変更です。各章に理由を書いています。
	</p>

	<H2 id="correctness" />

	{@render item('P1', '書き出す source map と lookup の答えが違った', 'fixed', 'output/emitter.rs · Emitter::source_map、Emitter::lookup')}
	<p>
		<code>source_map</code> は Mapping 一つにつき一つのセグメントを書いていたので、source map の読み手にはコピーの内側がすべてコピーの先頭に写っていました。今はコピーの文字ごとにセグメントを書き、<code
			>lookup</code
		>
		も読み手と同じく「同じ生成行で」探します。テストは書き出した source map を復号し、出力のすべての位置で二つの答えを比べます（<a
			href="/learn/kernel/emitter#disagreement">09</a
		>）。
	</p>
	<p>直す途中で、同じ場所に欠陥がさらに三つ見つかりました。</p>
	<ul>
		<li>複数行にまたがるコピーは、二行目以降にセグメントがなく、写らなかった。</li>
		<li>コピーの後の挿入テキストを引くと、最後の文字が多バイトのとき、文字の途中のバイトを返していた。</li>
		<li>
			型検査のタスクは、生成したテキストを tsc に渡すときに Emitter から抜き取っており、その後の <code>lookup</code>
			は空のテキストを相手にしていた。前の <code>lookup</code> がテキストを読まなかったので表に出ていなかった。
		</li>
	</ul>
	<p>
		変更の前後で検証用のソースファイル集の全出力を比べると、コンパイル、lint、型検査の出力は一バイトも変わりませんでした<Note
			>変更前と変更後のバイナリで <code>rsvelte fixtures</code> を走らせ、<code>actual/</code> の全ファイルのハッシュを突き合わせました。動いたのは、C3
			による整形の診断ファイルだけです。</Note
		>。
	</p>

	{@render item('P2', 'LineIndex::offset が存在しない列を丸めていた', 'fixed', 'source/positions.rs · LineIndex::offset')}
	<p>
		行末を越える列とサロゲートペアの内側を指す列は、今は <code>None</code> です。丸めに頼っていた呼び出し側は tsc
		のレポートの解析だけでした。tsc が行末の幅 0 の範囲を一列先まで下線で描くことを tsc 7.0.2 の実際の出力で確かめ、その一つの場合だけを解析の側で取り戻しています（<a
			href="/learn/kernel/source#offset">02</a
		>）。
	</p>

	{@render item('P3', '範囲の検査が debug ビルドだけだった', 'fixed', 'output/emitter.rs · Edits::apply_in、lint/rules.rs · run、check/report.rs · parse_report')}
	<p>
		<code>Edits</code> の重なりと範囲、lint ルールが自分の識別番号で報告しているかは、release でも確かめます。<code>Span::new</code> は
		<code>debug_assert!</code> のままです。パーサが読んだテキストから Span を作る、一番よく通る道だからです。その代わり、外から来た位置（tsc
		のレポート）は、Span を作る前に解析の側で確かめます。
	</p>

	{@render item('P4', 'LayoutInstruction のアリーナが書き換えられる', 'upstream', 'output/document.rs · LayoutInstructions::trim_left、trim_right、replace_parts')}
</div>

<Code item={data.code.trimLeft} mark={['self.replace_parts(d, &inner);']} />

<div class="prose-learn">
	<p>
		<code>trim</code> は既存のノードの子リストを差し替えるので、同じノードを二か所で使っていると、片方の <code>trim</code>
		がもう片方も変えます。これは直しませんでした。上流の prettier-plugin-svelte の <code>trimLeft</code> も、<code>getParts</code>
		が返した配列を <code>splice</code> でその場で書き換えます。同じ整形用データを共有した場合、公式ツールでも同じことが起きます<Note
			>prettier-plugin-svelte 4.1.1 の <code>plugin.js</code> で確かめました。</Note
		>。新しいノードを返す形に変えると、その場合の出力が上流と違ってしまいます。
	</p>

	{@render item('P5', 'panic のメッセージが空になることがあった', 'fixed', 'computation/pipeline.rs · panic_message')}
	<p>
		渡された値が文字列でないときも、空文字列ではなく決まった文を入れます（<a href="/learn/kernel/pipeline#run-document">06</a>）。
	</p>

	{@render item('P6', 'LineIndex::utf16 が多バイト文字の途中で桁あふれした', 'fixed', 'source/positions.rs · LineIndex')}
	<p>
		以前の列位置の変換処理は、直前の文字を読み、その長さを引いていました。複数バイトの文字の途中を指定すると、引き算があふれました。
		開発用ビルドでは異常終了し、最適化したビルドでは巨大な列番号を返していました。たとえば <code>utf16("é", 1)</code> で起きます。
		今は文字ごとのバイト範囲と列位置を表に保存し、二分探索で答えます（91fec70a6d、<a
			href="/learn/kernel/source#utf16">02</a
		>）。
	</p>

	{@render item('P7', 'shouldBreak の group が親の group を壊さなかった', 'fixed', 'output/document.rs · LayoutInstructions::push')}
	<p>
		<code>group_broken</code> で作った group が親の group を壊さず、Prettier と違う出力になっていました（708a4403d5、<a href="/learn/kernel/document#printer"
			>08</a
		>）。
	</p>

	{@render item('P8', '文字列の幅が Prettier と違った', 'fixed', 'output/width.rs · string_width')}
	<p>絵文字、異体字セレクタ、ゼロ幅の文字の数え方が違っていました。今は Unicode の幅の規則（unicode-width）で数えます。Prettier の表との一致は目的にしていません（b58a0a72be、<a href="/learn/kernel/document#flat-only">08</a>）。</p>

	{@render item('P9', '構造化データ形式の数値の位置に何でも書けた', 'fixed', 'output/structured_data.rs · StructuredDataWriter::write_number、fixed')}
	<p>整数と小数を別の関数に分け、有限でない小数は <code>null</code> にしました（37a595c11e、<a href="/learn/kernel/structured-data#state">10</a>）。</p>

	<H2 id="contracts" />

	{@render item('C1', 'Task::id のドキュメントの例が実際の識別番号と違った', 'fixed', 'computation/pipeline.rs · Task::identifier')}
	<p>
		実際の形 <code>&lt;言語&gt;.&lt;タスク&gt;/&lt;変種&gt;</code> と例（<code>svelte.compile/client</code>）に直しました。その後ドキュメントは書き直され、今は「タスクの選択と計測に使う名前」とだけ書き、名前の形は決めていません。
	</p>

	{@render item('C2', '知らないタスク識別番号を黙って無視していた', 'fixed', 'computation/pipeline.rs · Registry::check_task_identifiers、run_each')}
	<p>
		<code>run_each</code> と <code>run</code> は、知らない識別番号があれば何も走らせずに <code>Err(UnknownTask)</code> を返します。コマンドラインの実行プログラム
		も同じ関数で確かめます（<a href="/learn/kernel/pipeline#registry">06</a>）。
	</p>

	{@render item('C3', 'Unsupported が場所を持たなかった', 'fixed', 'diagnostics/diagnostic.rs · Unsupported')}
	<p>
		<code>Unsupported</code> は拒否した構文の <Term name="SourceLocation" /> を持ち、整形と型検査の型検査用のコードの診断はその構文を指します。位置を持たないのは文書全体についての判断（一行に収まらないレイアウト）だけで、それは
		<code>nowhere</code> と明示します。スタイルシートの整形も同じ型に揃えました（<a href="/learn/kernel/diagnostics#unsupported">07</a>）。
	</p>

	{@render item('C4', '設計メモと実装が食い違っていた', 'docs', 'docs/concept.md')}
	<p>
		設計メモを実装に合わせて直しました。位置の型はファイル情報を持たず、範囲だけを持ちます。
		必要な計算結果は、処理の計画を先に作るのではなく、要求された時点で計算します。
		ファイルの内容を比較して過去の計算結果を再利用する機能は、未実装と明記しました。
	</p>

	<H2 id="performance" />

	{@render item('F1', 'フェーズの行を名前の線形探索で探す', 'measured', 'performance/measurement.rs · PhaseGuard::drop')}
	<p>
		ガード一回の時間をマイクロベンチで測ると、およそ半分は計時のための二回の時計読みでした。表のロックと探索の分を多めに見積もっても、呼び出し回数を掛けると
		metrics ビルドの時間の 1% に届きません。番号で引く形にすると構造が複雑になるので、今は見送りました。
	</p>

	{@render item('F2', 'プロジェクト全体の処理の前処理がタスク数 × 文書数だった', 'open', 'computation/pipeline.rs · run_finish_tasks')}
	<p>
		部品は一度の走査でプロジェクトタスクごとに振り分けるように直しました。ただし、部品を持つプロジェクトタスクごとに全文書の出力を借りる表を作り直すので、全体の手間は今も「部品を持つプロジェクトタスクの数 × 全文書の出力の数」です。この残りはまだ直していません。関数のコメントは、この手間を書くように直しました（dbe55a0683、<a
			href="/learn/kernel/pipeline#project">06</a
		>）。
	</p>

	{@render item('F3', 'プロジェクト全体の処理を待つ文書が、全タスクの出力を抱える', 'open', 'computation/pipeline.rs · run_each')}
</div>

<Code item={data.code.runEach} mark={['.push((i, r));']} />

<div class="prose-learn">
	<p>
		部品を持つ文書は <code>DocumentResult</code> ごと待機リストに入るので、同じ文書の compile や format の出力も型検査が終わるまで解放されません。直すには、文書の結果を「確定した出力」と「プロジェクト全体の処理を待つ出力」に分けて前者を先に
		sink に渡すことになり、sink の守るべき条件（一文書一回）が変わります。呼び出し側と相談してから決めます。
	</p>

	{@render item('F4', 'pool とスレッドの小さな無駄', 'fixed', 'performance/buffer_pool.rs · take、computation/pipeline.rs · in_pool、run_document')}
	<ul>
		<li>
			<code>RunOptions::threads</code> を指定した実行は、毎回新しいスレッドプールを作っていました。今は最後に使ったスレッド数のプールを一つ、プロセスのあいだ残します。
		</li>
		<li><code>Sharing::Isolated</code> でも使わない <code>shared</code> の <Term name="DocumentContext" /> を作っていました。今は最初に求められたときに作ります。</li>
		<li>
			<span class="text-accent">未着手</span>: <code>take</code> は後入れ先出しで、大きな文書に小さなバッファを渡すことがあります。<code>take</code>
			は必要な大きさを知らないので、選び方を変えるなら呼び出し側から大きさの見込みを渡す形になります。どれが効くかは測ってから決めます。
		</li>
	</ul>
</div>

<Code item={data.code.take} />

<div class="prose-learn">
	{@render item('F5', 'Interner がヒットでもテーブルを拡張した', 'fixed', 'source/interning.rs · Interner::intern')}
	<p>拡張の判定は、名前が見つからなかったときだけ行います（<a href="/learn/kernel/interning#growth">03</a>）。</p>

	{@render item('F6', 'run が文書ごとにロックを取っていた', 'fixed', 'computation/pipeline.rs · run')}
	<p>結果は rayon の <code>collect</code> で順に集めます。割り当て回数がプラットフォームに依存しなくなりました（a5f67528cd、<a href="/learn/kernel/pipeline#run">06</a>）。</p>

	<h3 class="mt-12 text-[19px] leading-[1.55] font-semibold">性能への影響</h3>
	<p>
		F2、F4、F5 は性能の修正ですが、検証用のソースファイル集全体の時間は動きませんでした。変更前 → 変更後 → 変更後 → 変更前の順に同じ検証用のソースファイル集（{data.polish.documents.toLocaleString('en-US')} 文書）を走らせた中央値（ms、plain
		ビルド）です。
	</p>
	<div class="overflow-x-auto"><table class="table">
		<thead>
			<tr><th>比較対象</th><th class="num">変更前（1 回目 / 2 回目）</th><th class="num">変更後（1 回目 / 2 回目）</th></tr>
		</thead>
		<tbody>
			{#each data.polish.arms as a (a.name)}
				<tr>
					<td><code>{a.name}</code></td>
					<td class="num">{ms(a.before[0])} / {ms(a.before[1])}</td>
					<td class="num">{ms(a.after[0])} / {ms(a.after[1])}</td>
				</tr>
			{/each}
		</tbody>
	</table></div>
	<p>
		変更の前後の差は、同じ比較対象を二回測ったときの揺れより小さく、速くなったとも遅くなったとも言えません。スレッドプールを残すようにしても
		<code>serial</code> が変わらないので、作り直しのコストは無視できる大きさだったことも分かります<Note
			>計測の時間帯には Spotlight の索引作成が動いていました。前後を交互に並べたのは、その揺れを両方の比較対象に等しく乗せるためです。</Note
		>。
	</p>

	<H2 id="measurement" />

	{@render item('M1', 'ピークは増分で、負の生存量を 0 に丸める', 'docs', 'performance/measurement.rs · GlobalMeasurements')}
	<p>
		追跡を始める前に確保したメモリは入らず、それを解放すると生存量が負になって「増えていない」と読めることを、<code>peak_live_growth</code>
		のドキュメントに書きました。
	</p>

	{@render item('M2', 'フェーズの self はスレッド時間の合計', 'docs', 'performance/measurement.rs · PhaseMeasurements')}
	<p>
		<code>PhaseMeasurements</code> の時間は、フェーズを走らせたスレッドの実行時間の時間をスレッドについて足したものです。プロセッサー
		時間でも経過時間でもないので、割合で読むことを <code>PhaseMeasurements</code> のドキュメントに書きました。
	</p>

	{@render item('M3', 'フェーズのガードを別のスレッドで落とせた', 'fixed', 'performance/measurement.rs · PhaseGuard')}
	<p>
		ガードは <code>Send</code> でない型になり、順番を違えて落とすと debug ビルドで止まります。<Term name="CountingAllocator" /> は <code>alloc_zeroed</code>
		を転送するようになりました（2f8bef970a、<a href="/learn/kernel/measurement#phases">11</a>）。
	</p>

	{@render item('M4', '命令数の基準値を作業ツリーのテスト用の入力と期待値で測っていた', 'fixed', 'tools/performance/linux.sh')}
	<p>ステージしたテスト用の入力と期待値のスナップショットを測るようにしました（201b86fd6b、<a href="/learn/measure#ci">13</a>）。</p>
</div>

<ChapterFooter chapter={c} />
