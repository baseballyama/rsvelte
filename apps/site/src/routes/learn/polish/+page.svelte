<script lang="ts">
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import H2 from '$lib/components/H2.svelte';
	import { chapter } from '$lib/site';

	let { data } = $props();
	const c = chapter('polish');
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="カーネルを読みながら見つけた、直す価値のある箇所の一覧です。どれもコードで確かめた事実で、効果の大きさはまだ測っていません。直すかどうかは、測ってから決めることになります。"
/>

{#snippet item(n: string, title: string, where: string)}
	<h3 class="mt-12 flex items-baseline gap-3 text-[19px] leading-[1.55] font-semibold">
		<span class="font-mono text-[13px] font-normal tracking-normal text-muted">{n}</span>{title}
	</h3>
	<p class="mt-1 font-mono text-[12px] tracking-normal text-muted">{where}</p>
{/snippet}

<div class="prose-learn">
	<H2 id="correctness" />

	{@render item('P1', '書き出す source map が、コピーの内側を先頭に写す', 'emit.rs · Emitter::source_map')}
	<p>
		<code>source_map</code> は Mapping 一つにつき一つのセグメントを書くので、標準の読み方ではコピーの内側がすべてコピーの先頭に写ります。<code
			>lookup</code
		>
		は 1 対 1 に写すので、同じ Emitter について二つの答えが食い違います（<a href="/learn/kernel/emit#disagreement">08</a> の図 8.1）。
	</p>
	<p><strong>候補</strong>: コピーを文字（または識別子の境界）ごとのセグメントに展開して書き出す。<code>lookup</code> を基準にしたテストで、両者の一致を確かめる。</p>

	{@render item('P2', 'LineIndex::offset が、存在しない列を黙って丸める', 'source.rs · LineIndex::offset')}
</div>

<Code item={data.code.offset} mark={['Some(src.len() as u32)']} />

<div class="prose-learn">
	<p>
		列が行末を越えると行末を、最後の行で越えると <code>src.len()</code> を返します。呼び出し側は「その位置が本当にあったか」を区別できません。外部の道具（tsc
		など）が報告した行と列を受け取るときに、ずれを隠します。
	</p>
	<p><strong>候補</strong>: 行末を越えた列は <code>None</code> にするか、丸めたかどうかを返す。今の呼び出し側が丸めに頼っていないかを先に確かめる。</p>

	{@render item('P3', '範囲の検査が debug ビルドだけ', 'source.rs · Span::new、emit.rs · Edits::apply_in、lint.rs · run')}
</div>

<Code item={data.code.spanNew} />

<div class="prose-learn">
	<p>
		<code>Span::new</code> の <code>lo &lt;= hi</code>、<code>Edits</code> の重なり、lint ルールが自分の ID で報告しているか。いずれも
		<code>debug_assert!</code> で、release ビルドでは確かめません。壊れた値は、作った場所ではなく、使った場所（スライスの panic や誤った出力）で表に出ます。
	</p>
	<p><strong>候補</strong>: 境界（外部入力から Span を作るところ、Edits の適用の入口）だけは release でも確かめる。コストは一回の比較です。</p>

	{@render item('P4', 'Doc のアリーナが書き換えられる', 'doc.rs · Docs::replace_parts、trim_left、trim_right')}
</div>

<Code item={data.code.replaceParts} />

<div class="prose-learn">
	<p>
		<code>trim</code> は既存のノードの子リストを差し替えます。ノードは <code>Copy</code> な ID で配れるので、同じノードを二か所で使っていると、片方の
		<code>trim</code> がもう片方も変えます。<code>remove_lines</code> は逆に新しいノードを作るので、アリーナの中に二つの流儀が混ざっています。
	</p>
	<p><strong>候補</strong>: <code>trim</code> も新しいノードを返す形に揃える。整形の割り当てが増えるかは、フェーズ表の <code>svelte.format/default</code> で測る。</p>

	{@render item('P5', 'panic のメッセージが空になることがある', 'pipeline.rs · panic_message')}
</div>

<Code item={data.code.panicMessage} mark={['.unwrap_or_default()']} />

<div class="prose-learn">
	<p>
		ペイロードが <code>String</code> でも <code>&amp;str</code> でもないと、空文字列になります。レポートの panic 欄に「panic したが理由は空」という行ができ、値がないことと空の値が区別できません。
	</p>
	<p><strong>候補</strong>: 型が分からないときは <code>"panic with a non-string payload"</code> のような、空でない決まった文を入れる。</p>

	<H2 id="contracts" />

	{@render item('C1', 'Task::id のドキュメントの例が実際の ID と違う', 'pipeline.rs · Task::id')}
</div>

<Code item={data.code.taskId} />
<Code item={data.code.taskImpl} />

<div class="prose-learn">
	<p>
		ドキュメントは <code>svelte.compile.client</code> と書いていますが、実際の ID は <code>svelte.compile/client</code> です。ID は
		CLI の <code>--task</code> でも、フェーズの名前でも使うので、書き方の約束はドキュメントに正しく残すべきです。
	</p>

	{@render item('C2', '知らないタスク ID を黙って無視する', 'pipeline.rs · Registry::selected')}
</div>

<Code item={data.code.selected} />

<div class="prose-learn">
	<p>
		<code>RunOptions::tasks</code> に登録されていない ID を渡すと、そのタスクは選ばれず、何も起きずに成功します。CLI は自分で確かめていますが、カーネルを直接使う呼び出し側（テストやほかのホスト）は守られません。
	</p>
	<p><strong>候補</strong>: <code>run_each</code> の入口で、知らない ID を <code>Err</code> にする。</p>

	{@render item('C3', 'Unsupported が場所を持たない', 'diag.rs · Unsupported')}
</div>

<Code item={data.code.unsupported} />

<div class="prose-learn">
	<p>
		「未対応」の診断は位置が <code>Span::new(0, 0)</code> になり、どの構文が原因かはメッセージにしか残りません。エディタでその場所を示せず、コーパスで「どの構文が何件拒否されたか」を位置つきで集計することもできません。
	</p>
	<p><strong>候補</strong>: <code>Unsupported(&amp;'static str, Span)</code> にする。</p>

	{@render item('C4', '設計メモと実装の食い違い', '実験ブランチの設計メモ')}
	<ul>
		<li>設計メモは <code>Span {'{'} file, lo, hi {'}'}</code> と書いていますが、カーネルの <code>Span</code> はファイルを持ちません（<a href="/learn/kernel/source#span">02</a>）。</li>
		<li>
			設計メモは「タスクが必要な派生物を宣言し、スケジューラが最小の計画を組む」と書いていますが、実装は宣言を持たず、<code>get</code> で遅延計算します（<a
				href="/learn/kernel/db#sharing">04</a
			>）。
		</li>
	</ul>
	<p>どちらも実装のほうが筋が通っています。メモのほうを直すのが先です。</p>

	<H2 id="performance" />

	{@render item('F1', 'フェーズの行を名前の線形探索で探す', 'metrics.rs · PhaseGuard::drop')}
</div>

<Code item={data.code.drop} mark={['.position(|r| std::ptr::eq(r.name, f.name) || r.name == f.name)', 'let mut t = t.lock().unwrap();']} />

<div class="prose-learn">
	<p>
		ガードが落ちるたびに、そのスレッドの表の <code>Mutex</code> を取り、行を線形に探します。フェーズの種類が十数個の今は小さなコストですが、lint
		ルールはルールごとにフェーズになるので、ルールが増えるほど効いてきます。metrics ありのビルドは約 7% 遅くなっていますが、そのうちどれだけがここから来るかは測っていません。
	</p>
	<p><strong>候補</strong>: フェーズ名を最初の出会いで小さな番号に変え、スレッドローカルの配列を番号で引く。表を共有するのは <code>snapshot</code> のときだけにする。</p>

	{@render item('F2', 'プロジェクトパスの前処理が文書数に比例して繰り返される', 'pipeline.rs · finish_project')}
</div>

<Code item={data.code.finishProject} mark={['.partition::<Vec<_>, _>(|(pk, _, _)| *pk == k);', 'let mut by_doc: Vec<Vec<Option<&mut TaskOutput>>> = results']} />

<div class="prose-learn">
	<p>
		プロジェクトタスクごとに、待機中の全文書の <code>parts</code> を <code>partition</code> し直し、全文書の全出力への参照の表を作り直します。プロジェクトタスクが一つの今は問題になりませんが、形としてはタスク数 × 文書数です。
	</p>
	<p><strong>候補</strong>: 並列パスの終わりに、部品をプロジェクトタスクごとのリストへ一回で振り分ける。</p>

	{@render item('F3', 'プロジェクトパスを待つ文書が、全タスクの出力を抱える', 'pipeline.rs · run_each')}
</div>

<Code item={data.code.runEach} mark={['.push((i, r));']} />

<div class="prose-learn">
	<p>
		部品を持つ文書は <code>DocResult</code> ごと待機リストに入ります。同じ文書の compile や format の出力も、型検査が終わるまで解放されません。型検査を選び、TypeScript
		のコンポーネントが多いプロジェクトほど、ストリーミングの効果（<a href="/learn/measure#memory">12</a>）が薄れます。
	</p>
	<p><strong>候補</strong>: 文書の結果を「確定した出力」と「プロジェクトパスを待つ出力」に分け、前者は先に sink に渡す。sink の契約（一文書一回）を変えることになるので、呼び出し側との相談が要る。</p>

	{@render item('F4', 'pool は容量を見ずに最後のものを渡す', 'pool.rs · take')}
</div>

<Code item={data.code.take} />

<div class="prose-learn">
	<p>
		<code>take</code> は後入れ先出しで、大きな文書に小さなバッファを渡すことがあります（<a href="/learn/kernel/pool#limits">11</a>
		の図）。また、<code>RunOptions::threads</code> を指定した実行はそのたびに新しいスレッドを作るので、前の実行で貯めた容量は使えません。<code
			>Sharing::Isolated</code
		>
		でも使わない <code>shared</code> の <code>Ctx</code> を一つ作っています。どれも小さなものですが、測らずに直す理由もありません。
	</p>

	<H2 id="measurement" />

	{@render item('M1', 'ピークは増分で、負の生存量を 0 に丸める', 'metrics.rs · global')}
</div>

<Code item={data.code.global} mark={['PEAK.load(Relaxed).max(0) as u64']} />

<div class="prose-learn">
	<p>
		追跡を始める前に確保したメモリを解放すると、生存量は負になり、ピークは 0 に丸められます。フィールド名（<code>peak_live_growth</code>）は正しく「増分」と言っていますが、レポートを読む人が「使ったメモリ」と読み違えやすい量です。レポートでは最大
		RSS と並べて出しています。
	</p>

	{@render item('M2', 'フェーズの self はスレッド時間の合計', 'metrics.rs · snapshot')}
	<p>
		<code>snapshot</code> は全スレッドの表を足すので、self の合計は壁時計の時間ではありません。ベンチマークの JSON はこれを <code>self_ms</code>
		と書き、設計文書の表は「self CPU ms」と書いていますが、実際に測っているのはスレッドごとの壁時計の時間（<code>Instant</code>）の合計で、CPU
		時間ではありません。スレッドが待たされている時間も入ります。
	</p>
	<p><strong>候補</strong>: 名前を「スレッド時間の合計」に揃え、割合で読むことをレポートに書く。</p>
</div>

<ChapterFooter chapter={c} />
