<script lang="ts">
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
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="カーネルを読んで見つけた、直す価値のある箇所と、それぞれをどうしたかの一覧です。直したものは各章の説明もその実装に合わせてあります。直さなかったものには、直さなかった理由を書いています。"
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
	<H2 id="correctness" />

	{@render item('P1', '書き出す source map と lookup の答えが違った', 'fixed', 'emit.rs · Emitter::source_map、Emitter::lookup')}
	<p>
		<code>source_map</code> は Mapping 一つにつき一つのセグメントを書いていたので、source map の読み手にはコピーの内側がすべてコピーの先頭に写っていました。今はコピーの文字ごとにセグメントを書き、<code
			>lookup</code
		>
		も読み手と同じく「同じ生成行で」探します。テストは書き出した source map を復号し、出力のすべての位置で二つの答えを比べます（<a
			href="/learn/kernel/emit#disagreement">08</a
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
		変更の前後でコーパスの全出力を比べると、コンパイル、lint、型検査の出力は一バイトも変わりませんでした<Note
			>変更前と変更後のバイナリで <code>rsv fixtures</code> を走らせ、<code>actual/</code> の全ファイルのハッシュを突き合わせました。動いたのは、C3
			による整形の診断ファイルだけです。</Note
		>。
	</p>

	{@render item('P2', 'LineIndex::offset が存在しない列を丸めていた', 'fixed', 'source.rs · LineIndex::offset')}
	<p>
		行末を越える列とサロゲートペアの内側を指す列は、今は <code>None</code> です。丸めに頼っていた呼び出し側は tsc
		のレポートの解析だけでした。tsc が行末の幅 0 の範囲を一列先まで下線で描くことを tsc 7.0.2 の実際の出力で確かめ、その一つの場合だけを解析の側で取り戻しています（<a
			href="/learn/kernel/source#offset">02</a
		>）。
	</p>

	{@render item('P3', '範囲の検査が debug ビルドだけだった', 'fixed', 'emit.rs · Edits::apply_in、lint.rs · run、check.rs · parse_report')}
	<p>
		<code>Edits</code> の重なりと範囲、lint ルールが自分の ID で報告しているかは、release でも確かめます。<code>Span::new</code> は
		<code>debug_assert!</code> のままです。パーサが読んだテキストから Span を作る、一番よく通る道だからです。その代わり、外から来た位置（tsc
		のレポート）は、Span を作る前に解析の側で確かめます。
	</p>

	{@render item('P4', 'Doc のアリーナが書き換えられる', 'upstream', 'doc.rs · Docs::trim_left、trim_right、replace_parts')}
</div>

<Code item={data.code.trimLeft} mark={['self.replace_parts(d, &inner);']} />

<div class="prose-learn">
	<p>
		<code>trim</code> は既存のノードの子リストを差し替えるので、同じノードを二か所で使っていると、片方の <code>trim</code>
		がもう片方も変えます。これは直しませんでした。上流の prettier-plugin-svelte の <code>trimLeft</code> も、<code>getParts</code>
		が返した配列を <code>splice</code> でその場で書き換えるので、共有された doc について同じことが起きます<Note
			>prettier-plugin-svelte 4.1.1 の <code>plugin.js</code> で確かめました。</Note
		>。新しいノードを返す形に変えると、その場合の出力が上流と違ってしまいます。
	</p>

	{@render item('P5', 'panic のメッセージが空になることがあった', 'fixed', 'pipeline.rs · panic_message')}
	<p>
		ペイロードが文字列でないときも、空文字列ではなく決まった文を入れます（<a href="/learn/kernel/pipeline#run-document">05</a>）。
	</p>

	<H2 id="contracts" />

	{@render item('C1', 'Task::id のドキュメントの例が実際の ID と違った', 'fixed', 'pipeline.rs · Task::id')}
	<p>実際の形 <code>&lt;言語&gt;.&lt;タスク&gt;/&lt;変種&gt;</code> と例（<code>svelte.compile/client</code>）に直しました。</p>

	{@render item('C2', '知らないタスク ID を黙って無視していた', 'fixed', 'pipeline.rs · Registry::check_task_ids、run_each')}
	<p>
		<code>run_each</code> と <code>run</code> は、知らない ID があれば何も走らせずに <code>Err(UnknownTask)</code> を返します。CLI
		も同じ関数で確かめます（<a href="/learn/kernel/pipeline#registry">05</a>）。
	</p>

	{@render item('C3', 'Unsupported が場所を持たなかった', 'fixed', 'diag.rs · Unsupported')}
	<p>
		<code>Unsupported</code> は拒否した構文の <code>Loc</code> を持ち、整形と型検査の射影の診断はその構文を指します。位置を持たないのは文書全体についての判断（一行に収まらないレイアウト）だけで、それは
		<code>nowhere</code> と明示します。CSS の整形も同じ型に揃えました（<a href="/learn/kernel/diagnostics#unsupported">06</a>）。
	</p>

	{@render item('C4', '設計メモと実装が食い違っていた', 'docs', 'docs/concept.md')}
	<p>
		設計メモの <code>Span {'{'} file, lo, hi {'}'}</code> と「タスクが派生物を宣言し、スケジューラが計画を組む」を、実装（ファイルを持たない
		<code>Span</code>、<code>ctx.get</code> による遅延計算）に合わせて書き直しました。内容ハッシュで時間方向に持ち越す部分は、まだ実装していないと明記しています。
	</p>

	<H2 id="performance" />

	{@render item('F1', 'フェーズの行を名前の線形探索で探す', 'measured', 'metrics.rs · PhaseGuard::drop')}
	<p>
		ガード一回の時間をマイクロベンチで測ると、およそ半分は計時のための二回の時計読みでした。表のロックと探索の分を多めに見積もっても、呼び出し回数を掛けると
		metrics ビルドの時間の 1% に届きません。番号で引く形にすると構造が複雑になるので、今は見送りました。
	</p>

	{@render item('F2', 'プロジェクトパスの前処理がタスク数 × 文書数だった', 'fixed', 'pipeline.rs · finish_projects')}
	<p>部品は一度の走査でプロジェクトタスクごとに振り分けます（<a href="/learn/kernel/pipeline#project">05</a>）。</p>

	{@render item('F3', 'プロジェクトパスを待つ文書が、全タスクの出力を抱える', 'open', 'pipeline.rs · run_each')}
</div>

<Code item={data.code.runEach} mark={['.push((i, r));']} />

<div class="prose-learn">
	<p>
		部品を持つ文書は <code>DocResult</code> ごと待機リストに入るので、同じ文書の compile や format の出力も型検査が終わるまで解放されません。直すには、文書の結果を「確定した出力」と「プロジェクトパスを待つ出力」に分けて前者を先に
		sink に渡すことになり、sink の契約（一文書一回）が変わります。呼び出し側と相談してから決めます。
	</p>

	{@render item('F4', 'pool とスレッドの小さな無駄', 'fixed', 'pool.rs · take、pipeline.rs · in_pool、run_document')}
	<ul>
		<li>
			<code>RunOptions::threads</code> を指定した実行は、毎回新しいスレッドプールを作っていました。今はスレッド数ごとのプールをプロセスのあいだ残します。
		</li>
		<li><code>Sharing::Isolated</code> でも使わない <code>shared</code> の <code>Ctx</code> を作っていました。今は最初に求められたときに作ります。</li>
		<li>
			<span class="text-accent">未着手</span>: <code>take</code> は後入れ先出しで、大きな文書に小さなバッファを渡すことがあります。<code>take</code>
			は必要な大きさを知らないので、選び方を変えるなら呼び出し側から大きさの見込みを渡す形になります。どれが効くかは測ってから決めます。
		</li>
	</ul>
</div>

<Code item={data.code.take} />

<div class="prose-learn">
	{@render item('F5', 'Interner がヒットでもテーブルを拡張した', 'fixed', 'intern.rs · Interner::intern')}
	<p>拡張の判定は、名前が見つからなかったときだけ行います（<a href="/learn/kernel/intern#growth">03</a>）。</p>

	<h3 class="mt-12 text-[19px] leading-[1.55] font-semibold">性能への影響</h3>
	<p>
		F2、F4、F5 は性能の修正ですが、コーパス全体の時間は動きませんでした。変更前 → 変更後 → 変更後 → 変更前の順に同じコーパスを走らせた中央値（ms、plain
		ビルド）です。
	</p>
	<table class="table">
		<thead>
			<tr><th>アーム</th><th class="num">変更前（1 回目 / 2 回目）</th><th class="num">変更後（1 回目 / 2 回目）</th></tr>
		</thead>
		<tbody>
			{#each data.arms as a (a.name)}
				<tr>
					<td><code>{a.name}</code></td>
					<td class="num">{ms(a.before[0])} / {ms(a.before[1])}</td>
					<td class="num">{ms(a.after[0])} / {ms(a.after[1])}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<p>
		変更の前後の差は、同じアームを二回測ったときの揺れより小さく、速くなったとも遅くなったとも言えません。スレッドプールを残すようにしても
		<code>serial</code> が変わらないので、作り直しのコストは無視できる大きさだったことも分かります<Note
			>計測の時間帯には Spotlight の索引作成が動いていました。前後を交互に並べたのは、その揺れを両方のアームに等しく乗せるためです。</Note
		>。
	</p>

	<H2 id="measurement" />

	{@render item('M1', 'ピークは増分で、負の生存量を 0 に丸める', 'docs', 'metrics.rs · GlobalStats')}
	<p>
		追跡を始める前に確保したメモリは入らず、それを解放すると生存量が負になって「増えていない」と読めることを、<code>peak_live_growth</code>
		のドキュメントに書きました。
	</p>

	{@render item('M2', 'フェーズの self はスレッド時間の合計', 'docs', 'metrics.rs · PhaseStats、docs/architecture.md')}
	<p>
		<code>PhaseStats</code> の時間は、フェーズを走らせたスレッドの壁時計の時間をスレッドについて足したものです。CPU
		時間でも経過時間でもないので、割合で読むことをドキュメントに書き、設計文書の表の見出しを「self CPU ms」から「self ms（スレッド時間の合計）」に直しました。
	</p>
</div>

<ChapterFooter chapter={c} />
