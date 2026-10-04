<script lang="ts">
	import Term from '$lib/components/Term.svelte';
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import DeepDive from '$lib/components/DeepDive.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import PipelineTimeline from '$lib/widgets/PipelineTimeline.svelte';

	let { data } = $props();
	const c = chapter('pipeline');
	const mb = (b: number) => (b / 1e6).toFixed(1);
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="プラグインが登録したものを、文書の集合に対して走らせる部分です。文書ごとに並列に処理し、結果が確定したものから呼び出し側に返します。他の文書を必要とする型検査のために、二段目のパスも持っています。"
/>

<div class="prose-learn">
	<H2 id="document" />
	<p>
		<dfn>Document</dfn> はパスとテキストだけを持ちます。<code>#[non_exhaustive]</code> なので、外からは
		<code>Document::new</code> か <code>Registry::document</code> でしか作れず、長さの上限は必ず確かめられます（<a
			href="/learn/kernel/source#loc">02</a
		>）。
	</p>
</div>

<Code item={data.code.document} />

<div class="prose-learn">
	<p>カーネルは文書の言語を決めません。未知の拡張子や拡張子のないパスも受け入れます。各プラグインがパスや内容から処理対象かを判断し、一つの文書を複数のタスクが処理できます。対象のタスクがなければ、結果は空です。</p>
</div>

<Code item={data.code.regDocument} />

<div class="prose-learn">
	<H2 id="tasks" />
	<p>
		<dfn>Task</dfn> は文書一つで完結する処理です。compile、format、lint がそうです。<code>applies</code>
		で自分の文書かを判断し、<code>run</code> で結果を <code>TaskOutput</code> に書きます。
	</p>
	<p>独自の処理を追加する手順は、<a href="/learn/plugins">15 プラグインを実装する</a>で説明しています。計算結果とタスクを登録する手順を、実行できる言語プラグインの例で示します。</p>
</div>

<Code item={data.code.task} />
<Code item={data.code.taskOutput} />

<div class="prose-learn">
	<p>
		他の文書も必要な処理は、一つの文書だけでは完結しません。たとえば型検査では、参照する他のファイルの宣言も調べます。
		このような処理を <dfn>FinishTask</dfn> として、文書ごとの準備と、全文書を集めた実行に分けます。
	</p>
</div>

<Code item={data.code.finishTask} />
<Code item={data.code.part} />

<div class="prose-learn">
	<p>
		<code>prepare</code> は文書のワーカーの上で、その文書の <Term name="DocumentContext" /> を使って走ります。ここで必要なものを
		<code>Part</code> として取り出します。<code>Part</code> は所有権を持つ値でなければなりません。<code>finish</code>
		が走るころには、文書の <Term name="DocumentContext" /> はもうないからです。
	</p>
	<p>
		現在の TypeScript 型検査では、文書内の compile・format・lint の後に <code>prepare</code> が走ります。
		compile も選んでいれば、その文書の JavaScript/スタイルシートはすでに生成済みです。
		型検査はその JavaScript を入力にせず、元の構文木から型検査用の TypeScript を別に作ります。
		<code>prepare</code> はコンパイルの準備ではなく、型検査に渡す文書ごとのデータを用意する処理です。
		型検査だけを選んだ場合は、compile を実行せずにこの処理へ進みます。
	</p>
	<p>
		型検査のプロジェクトタスクは、言語プラグインの中ではなく <code>rsvelte_typescript_check</code> に一つだけあります。どの文書を扱うかは
		<code>matches</code> に渡す判定関数で決めます。Svelte 用と Vue 用を登録します。コマンドラインの実行プログラムは、TypeScript・Svelte・Vue をまとめて扱うもの（<code>ts.check/default</code>）も登録します。
	</p>
</div>

<Code item={data.code.check} />

<div class="prose-learn">
	<p>
		<code>prepare</code> は、共通の呼び出し窓口から型検査用のコードを取得します（<a href="/learn/kernel/database#facet">04</a>）。
		生成したテキスト、元のテキスト、両者の位置の対応を <code>Part</code> に保存します。
		言語プラグインがその文書を型検査の対象にしない場合は、<Term name="TypeScriptDocument::Unchecked" /> と答えます。そのときは空の結果を書いて <code>None</code> を返し、プロジェクト全体の処理を待ちません。
	</p>
</div>

<Code item={data.code.checkPrepare} mark={['Ok(TypeScriptDocument::Unchecked) =>', 'Some(Box::new(Prepared {']} />

<div class="prose-learn">
	<H2 id="registry" />
	<p>
		走らせるタスクは <code>RunOptions::tasks</code> で選びます。空なら全部です。
	</p>
</div>

<Code item={data.code.runOptions} />
<Code item={data.code.selected} />

<div class="prose-learn">
	<p>
		<code>selected</code> は識別番号で絞るだけなので、登録されていない識別番号はどのタスクにも一致しません。放っておくと、識別番号
		を打ち間違えた実行が何も走らずに成功してしまいます。そこで <code>run_each</code> と <code>run</code> は、入口でまずプラグインの依存関係を確かめ（<code>validate_plugins</code>）、次に <code>check_task_identifiers</code>
		を呼びます。知らない識別番号があれば、何も走らせずに <code>Err(UnknownTask)</code> を返します。コマンドラインの実行プログラム も同じ関数で引数を確かめています。
	</p>
</div>

<Code item={data.code.checkTaskIds} />

<div class="prose-learn">
	<H2 id="run-document" />
	<p>
		文書一つの処理は <code>run_document</code> です。<a href="/learn/kernel#life">01 全体像</a>で見たとおり、<Term name="DocumentContext" />
		を作り、タスクを登録順に走らせ、続けてプロジェクトタスクの <code>prepare</code> を走らせます。
	</p>
</div>

<Code item={data.code.runDocument} mark={['catch_unwind', 'parts.push((k, outputs.len(), part))', 'panic: Some(panic_message(e))']} />

<div class="prose-learn">
	<p>
		全体は <code>catch_unwind</code> で包まれています。どこかのタスクが panic しても、止まるのはその文書だけで、他の文書の処理は続きます。panic
		した文書は、他のタスクの出力も含めてすべて捨て、メッセージだけを残します<Note
			>異常終了した文書の出力は、一部の処理が終わっていても正しいとは限りません。文書全体の出力を捨てることで、不完全な結果を返さずに済みます。</Note
		>。
	</p>
</div>

<Code item={data.code.panicMessage} />

<div class="prose-learn">
	<p>
		panic の渡された値は <code>String</code> か <code>&str</code> であることがほとんどですが、<code>std::panic::panic_any</code>
		を使えば任意の値を投げられます。その場合も空文字列にはせず、「文字列でない渡された値で panic した」という決まった文を入れます。空のメッセージは、値がないことと空の値を区別できないからです。
	</p>

	<H2 id="run-each" />
	<p>
		文書の集合を走らせる本体が <code>run_each</code> です。rayon で文書を並列に配り、結果が確定した文書はその場で
		<code>sink</code> に渡します。<code>sink</code> が戻れば、その結果は解放されます。
	</p>
</div>

<Code item={data.code.runEach} mark={['if r.parts.is_empty()', 'sink(i, r);', '.push((i, r));']} />

<PipelineTimeline />

<div class="prose-learn">
	<p>
		ポイントは、メモリのピークが<strong>検証用のソースファイル集の大きさ</strong>ではなく<strong>同時に処理中の文書</strong>で決まることです。ただし、部品を持つ文書だけはプロジェクト全体の処理まで待たされ、そのあいだ結果を持ち続けます。
	</p>
	<p>
		実測でも効果ははっきり出ています。{data.docs.toLocaleString('en-US')} 文書で、全結果を集めたときの使用中のメモリのピーク増分は {mb(data.shared.peak)}
		メガバイト、<code>run_each</code> で結果をすぐ捨てたときは {mb(data.streaming.peak)} メガバイト でした。時間の中央値は {data.shared.plain[0].toFixed(
			1
		)} ms と {data.streaming.plain[0].toFixed(1)} ms で、ほとんど変わりません。
	</p>

	<DeepDive title="待たされる文書が持っているもの">
		<p>
			待機リストに入るのは <code>DocumentResult</code> の全体です。<code>parts</code> だけでなく、同じ文書の compile や format の出力（<code
				>outputs</code
			>）も一緒に保持されます。プロジェクト全体の処理が要るのは部品と、その文書の型検査の出力の置き場所だけなので、他のタスクの出力は先に
			sink に渡せるはずです。今は、型検査を選んだときに TypeScript の文書が多いほど、ストリーミングの効果が薄れます。
		</p>
	</DeepDive>

	<H2 id="project" />
	<p>
		並列パスが終わると、待たせていた文書を元の順に並べ直し、<code>run_finish_tasks</code> がプロジェクトタスクごとに <code>finish</code> を一回呼びます。
	</p>
</div>

<Code item={data.code.finishTasks} mark={['by_task[k].push((d, o, part));']} />

<div class="prose-learn">
	<p>
		少し込み入っているのは、借用の都合です。<code>finish</code> には、部品と、その部品の持ち主の
		<code>TaskOutput</code> への可変参照を、同じ順で渡す必要があります。そこで、全文書の出力への参照を
		<code>Option</code> の表（<code>by_doc</code>）にしてから、持ち主の分だけ <code>take</code>
		で取り出しています。部品は最初に一度だけ走査して、プロジェクトタスクごとのリストに振り分けます。この振り分けの手間は部品の数に比例します。ただし部品を持つプロジェクトタスクごとに、全文書の全出力を借りる表を作り直すので、全体の手間は「部品を持つプロジェクトタスクの数 × 全文書の出力の数」に比例します。
	</p>
	<p>
		<code>finish</code> が panic したときは、部品を出したすべての文書を panic 扱いにします。どの文書のせいかは分からないからです。
	</p>
	<p>
		カーネルのテストは、プロジェクトタスクが部品を出した文書をちょうど一回ずつ見ること、プロジェクトタスクが二つあってもそれぞれが自分の部品だけを受け取ることを確かめています。
	</p>
</div>

<Code item={data.code.test} />
<Code item={data.code.testTwo} />

<div class="prose-learn">
	<H2 id="run" />
	<p>
		結果をまとめて受け取りたい呼び出し側のために、<code>run</code> があります。以前の <code>run</code> は <code>run_each</code>
		の上に書かれていて、<code>sink</code> が文書ごとの <code>Mutex</code> の 配列の位置に結果を置いていました。今は rayon の
		<code>collect</code> で、文書の順に集めます。
	</p>
</div>

<Code item={data.code.run} mark={['let compile = |d| run_document(reg, d, &tasks, &finish_tasks, options.sharing);']} />

<div class="prose-learn">
	<p>
		変更の理由は計測の再現性です。macOS のロック処理は初回にメモリを確保しますが、Linux では確保しません。
		そのため、割り当て回数が文書数（17,512）だけ違っていました。ロックをなくしてからは、macOS
		と Linux が同じ三つの数（割り当て回数、バイト数、使用中のメモリのピーク）を報告します（a5f67528cd）。この一致が、割り当ての回数を性能の基準値との比較検査で厳密に比べられる前提になっています（<a
			href="/learn/measure#ratchet">13</a
		>）。
	</p>
</div>

<div class="prose-learn">
	<p>
		2 以上のスレッド数を指定すると、<code>in_pool</code> がその数のスレッドプールで走らせます。1 なら、プールを作らずに呼び出したスレッドで順に処理します。最後に使ったプールを一つプロセスのあいだ残すので、同じスレッド数の実行を繰り返しても、スレッドとそのスレッドのバッファプール（<a
			href="/learn/kernel/buffer-pool">12</a
		>）を使い回せます。指定しなければ rayon の既定（コア数）です。1 スレッドのときの中央値は {data.serial.plain[0].toFixed(1)} ms で、既定の
		{data.shared.plain[0].toFixed(1)} ms の約 {(data.serial.plain[0] / data.shared.plain[0]).toFixed(1)} 倍でした。
	</p>
</div>

<Code item={data.code.inPool} />

<ChapterFooter chapter={c} />
