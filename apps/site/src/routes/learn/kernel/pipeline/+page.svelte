<script lang="ts">
	import ChapterFooter from '#lib/components/ChapterFooter.svelte';
	import ChapterHeader from '#lib/components/ChapterHeader.svelte';
	import Code from '#lib/components/Code.svelte';
	import DeepDive from '#lib/components/DeepDive.svelte';
	import H2 from '#lib/components/H2.svelte';
	import Note from '#lib/components/Note.svelte';
	import { chapter } from '#lib/site.ts';
	import PipelineTimeline from '#lib/widgets/PipelineTimeline.svelte';

	let { data } = $props();
	const c = chapter('pipeline');
	const mb = (b: number) => (b / 1e6).toFixed(1);
</script>

<svelte:head><title>{c.title} — rsvelte 開発者向けの教材</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="プラグインが登録した処理を、文書の集合に対して走らせる部分です。文書ごとに並列で処理し、結果が確定した文書から呼び出し側へ返します。型検査のように他の文書も必要な処理のために、全文書を集めて走らせる二段目もあります。"
/>

<div class="prose-learn">
	<H2 id="document" />
	<p>
		<dfn>Document</dfn> はパスとテキストだけを持ちます。<code>#[non_exhaustive]</code>
		なので、外からは
		<code>Document::new</code> か <code>Registry::document</code>
		でしか作れません。そのため、長さの上限は必ず確かめられます（<a href="/learn/kernel/source#loc"
			>02 章</a
		>）。
	</p>
</div>

<Code item={data.code.document} />

<div class="prose-learn">
	<p>
		カーネルは文書の言語を決めません。未知の拡張子や、拡張子のないパスも受け入れます。処理対象かどうかは、各プラグインがパスや内容から判断します。一つの文書を複数のタスクが処理でき、対象のタスクがなければ結果は空です。
	</p>
</div>

<Code item={data.code.regDocument} />

<div class="prose-learn">
	<H2 id="tasks" />
	<p>
		<dfn>Task</dfn> は、文書一つで完結する処理です。コンパイル、整形、コード検査がそうです。<code
			>applies</code
		>
		で自分の文書かを判断し、<code>run</code> で結果を <code>TaskOutput</code> に書きます。
	</p>
	<p>
		独自の処理の追加は、<a href="/learn/plugins">16 章「プラグインを実装する」</a>で説明しています。
	</p>
</div>

<Code item={data.code.task} />
<Code item={data.code.taskOutput} />

<div class="prose-learn">
	<p>
		他の文書も必要な処理は、一つの文書だけでは完結しません。たとえば型検査は、参照する他のファイルの宣言も調べます。このような処理は
		<dfn>FinishTask</dfn> として、文書ごとの準備と、全文書を集めた実行に分けます。
	</p>
</div>

<Code item={data.code.finishTask} />
<Code item={data.code.part} />

<div class="prose-learn">
	<p>
		<code>prepare</code> は文書のワーカーの上で走ります。計算結果を
		<code>DocumentContext</code
		>（文書ごとに計算結果を保存する領域）から読み、必要なものを部品（<code>Part</code
		>）として取り出します。<code>finish</code>
		が走るころには <code>DocumentContext</code> はもうないので、部品は所有権を持つ値でなければなりません。この章では、FinishTask
		をプロジェクトタスクと呼びます。
	</p>
	<p>
		型検査タスクは、Svelte や Vue、TypeScript のファイルを tsc で検査します。<code>prepare</code>
		は、文書のコンパイル・整形・コード検査のあとに走ります。コンパイルも選んでいれば、その文書の JavaScript
		とスタイルシートは生成済みです。それでも型検査はその JavaScript を使わず、元の構文木から型検査用の
		TypeScript を別に作ります。<code>prepare</code>
		が用意するのは、型検査に渡す文書ごとのデータです（次の段落）。型検査だけを選んだときは、コンパイルを実行せずに
		<code>prepare</code> へ進みます。
	</p>
	<p>
		型検査のプロジェクトタスクの実装は、言語プラグインごとではなく <code
			>rsvelte_typescript_check</code
		>
		に一つだけあります。どの文書を扱うかは、<code>documents</code> 欄の
		<code>Documents::Matching</code>
		に渡す判定関数で決めます。Svelte 用と Vue 用を登録します。CLI は、TypeScript・Svelte・Vue をまとめて扱うもの（<code
			>ts.check/default</code
		>）も登録します。
	</p>
</div>

<Code item={data.code.check} />

<div class="prose-learn">
	<p>
		<code>prepare</code> は、言語ごとの処理を呼び出す共通窓口（<code>facet</code>、<a
			href="/learn/kernel/database#facet">04 章</a
		>）から、型検査用のコード <code>TypeScriptView</code>
		を受け取ります。窓口を提供するプラグインがなければ
		<code>None</code> が返り、<code>prepare</code> もそのまま <code>None</code>
		を返します。生成したテキスト、元のテキスト、両者の位置の対応を <code>Part</code>
		に入れます。型検査しない文書には、言語プラグインが <code>TypeScriptDocument::Unchecked</code>
		を返します。そのときは空の結果を書いて <code>None</code> を返すので、その文書はプロジェクト全体の処理を待ちません。
	</p>
</div>

<Code
	item={data.code.checkPrepare}
	mark={['Ok(TypeScriptDocument::Unchecked) =>', 'Some(Box::new(Prepared {']}
/>

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
		<code>selected</code>
		は識別子で絞るだけなので、登録されていない識別子はどのタスクにも一致しません。そのままでは、識別子を打ち間違えた実行が、何も走らせずに成功してしまいます。そこで
		<code>run_each</code> と <code>run</code> は、入口でまず <code>validate_plugins</code>
		でプラグインの依存関係を確かめます。次に <code>check_task_identifiers</code>
		で識別子を確かめます。知らない識別子があれば、何も走らせずに <code>RunError::UnknownTask</code>
		を返します。CLI も同じ関数で引数を確かめています。
	</p>
</div>

<Code item={data.code.checkTaskIds} />

<div class="prose-learn">
	<H2 id="run-document" />
	<p>
		文書一つの処理は <code>run_document</code> です。<a href="/learn/kernel#life">01 章「全体像」</a
		>で見たとおり、<code>DocumentContext</code>
		を作り、タスクを登録順に走らせ、続けてプロジェクトタスクの <code>prepare</code>
		を走らせます。<code>Sharing::Shared</code> なら、文書のタスク全体で一つの
		<code>DocumentContext</code> を共有します。<code>Sharing::Isolated</code>
		ならタスクごとに作り直します。計算結果の作り方は、登録された計算結果の一覧（<code
			>reg.artifacts</code
		>）から引きます。
	</p>
</div>

<Code
	item={data.code.runDocument}
	mark={['catch_unwind', 'parts.push((k, outputs.len(), part))', 'panic: Some(panic_message(e))']}
/>

<div class="prose-learn">
	<p>
		全体は <code>catch_unwind</code> で包まれています。どこかのタスクが panic
		しても、止まるのはその文書だけで、他の文書の処理は続きます。panic
		した文書は、他のタスクの出力も含めてすべて捨て、メッセージだけを残します<Note
			>異常終了した文書の出力は、終わった処理の分でも正しいとは限りません。文書全体の出力を捨てれば、不完全な結果を返さずに済みます。</Note
		>。
	</p>
</div>

<Code item={data.code.panicMessage} />

<div class="prose-learn">
	<p>
		panic で渡される値は、ほとんどが <code>String</code> か <code>&str</code> です。ただし
		<code>std::panic::panic_any</code>
		を使えば、任意の値を投げられます。その場合も空文字列にはせず、決まった文（<code
			>panicked with a payload that is not a string</code
		>）を入れます。空のメッセージでは、値がないことと空の値を区別できないからです。
	</p>

	<H2 id="run-each" />
	<p>
		文書の集合を走らせる本体が <code>run_each</code> です。rayon
		で文書を並列に配り、結果が確定した文書はその場で
		<code>sink</code> に渡します。<code>sink</code> が戻れば、その結果は解放されます。
	</p>
</div>

<Code item={data.code.runEach} mark={['if r.parts.is_empty()', 'sink(i, r);', '.push((i, r));']} />

<PipelineTimeline />

<div class="prose-learn">
	<p>
		そのためメモリのピークは、渡した文書の総数ではなく、同時に処理中の文書で決まります。ただし部品を持つ文書は、プロジェクト全体の処理が終わるまで結果を持ち続けます。
	</p>
	<p>
		14 章のベンチマークの {data.docs.toLocaleString('en-US')} 文書で測ると、全結果を集めたときの使用中のメモリのピーク増分は
		{mb(data.shared.peak)} メガバイトでした。<code>run_each</code> で結果をすぐ捨てると
		{mb(data.streaming.peak)} メガバイトです。時間の中央値は {data.shared.plain[0].toFixed(1)} ms と
		{data.streaming.plain[0].toFixed(1)} ms で、ほとんど変わりません。
	</p>

	<DeepDive title="待たされる文書が持っているもの">
		<p>
			部品を持つ文書は、待機リストに入って全体の処理を待ちます。入るのは <code>DocumentResult</code>
			の全体です。<code>parts</code>
			に加えて、同じ文書の compile や format の出力（<code>outputs</code
			>）も残ります。プロジェクト全体の処理に要るのは、部品と、その文書の型検査の出力の置き場所だけです。他のタスクの出力は
			sink へ先に渡せますが、今は渡していません。そのため型検査を選ぶと、TypeScript
			の文書が多いほどストリーミングの効果が薄れます。
		</p>
	</DeepDive>

	<H2 id="project" />
	<p>
		並列の処理が終わると、待たせていた文書を元の順に並べ直します。そして <code
			>run_finish_tasks</code
		>
		が、プロジェクトタスクごとに <code>finish</code> を 1 回呼びます。
	</p>
</div>

<Code item={data.code.finishTasks} mark={['by_task[k].push((d, o, part));']} />

<div class="prose-learn">
	<p>
		込み入っているのは借用の都合です。<code>finish</code> には、部品と、その部品の持ち主の
		<code>TaskOutput</code>
		への可変参照を、同じ順で渡します。そこで全文書の出力への参照を
		<code>Option</code> の表（<code>by_doc</code>）にしてから、持ち主の分だけ <code>take</code>
		で取り出します。
	</p>
	<p>
		部品は最初に一度だけ走査して、プロジェクトタスクごとのリストに振り分けます。ただし部品を持つプロジェクトタスクごとに、全文書の全出力を借りる表を作り直します。そのため手間は、部品の数と、「部品を持つプロジェクトタスクの数
		× 全文書の出力の数」の和に比例します。
	</p>
	<p>
		<code>finish</code> が panic したときは、どの文書のせいか分からないので、部品を出したすべての文書を
		panic 扱いにします。
	</p>
	<p>
		カーネルのテストは二つのことを確かめています。プロジェクトタスクは、部品を出した文書をちょうど 1
		回ずつ見ます。プロジェクトタスクが二つあっても、それぞれ自分の部品だけを受け取ります。
	</p>
</div>

<Code item={data.code.test} />
<Code item={data.code.testTwo} />

<div class="prose-learn">
	<H2 id="run" />
	<p>
		結果をまとめて受け取りたい呼び出し側には <code>run</code>
		があります。文書の配り方（スレッドが一つなら順に、そうでなければ rayon で並列に）は、<code
			>run_each</code
		>
		と同じ <code>map_documents</code>
		が決めます。結果は文書の順に集めます。結果を集める部分にロックはありません（<code>in_pool</code>
		がスレッドプールを残すための <code>Mutex</code> は別で、取るのは実行ごとに多くて 1 回です）。
	</p>
</div>

<Code item={data.code.run} mark={['results = map_documents(docs, options.threads, |_, d| {']} />

<div class="prose-learn">
	<p>
		以前の <code>run</code> は、文書ごとに一つの <code>Mutex</code>
		を通して結果を置いていました。macOS のロック処理は初回にメモリを確保しますが、Linux では確保しません。そのため割り当て回数が、当時の文書数（17,512）だけ違っていました。ロックをなくしてからは、macOS
		と Linux が同じ三つの数（割り当て回数、バイト数、使用中のメモリのピーク）を報告します。この一致があるので、性能の比較検査で割り当ての回数を厳密に比べられます（<a
			href="/learn/measure#ratchet">14 章</a
		>）。
	</p>
</div>

<div class="prose-learn">
	<p>
		2 以上のスレッド数を指定すると、<code>in_pool</code> がその数のスレッドプールで走らせます。1
		なら、プールを作らずに呼び出したスレッドで順に処理します。指定しなければ rayon
		の既定（コア数）です。最後に使ったプールは、プロセスが終わるまで一つ残します。そのため同じスレッド数で繰り返し実行すると、スレッドと、そのスレッドのバッファプール（作業用の配列を使い回す仕組み、<a
			href="/learn/kernel/buffer-pool">13 章</a
		>）を使い回せます。1 スレッドのときの中央値は {data.serial.plain[0].toFixed(1)} ms で、既定の
		{data.shared.plain[0].toFixed(1)} ms の約 {(
			data.serial.plain[0] / data.shared.plain[0]
		).toFixed(1)} 倍でした。
	</p>
</div>

<Code item={data.code.inPool} />

<ChapterFooter chapter={c} />
