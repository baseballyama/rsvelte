<script lang="ts">
	import Caution from '$lib/components/Caution.svelte';
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
		<dfn>Document</dfn> はパスとテキストと言語の ID だけを持ちます。<code>#[non_exhaustive]</code> なので、外からは
		<code>Document::new</code> か <code>Registry::document</code> でしか作れず、長さの上限は必ず確かめられます（<a
			href="/learn/kernel/source#loc">02</a
		>）。
	</p>
</div>

<Code item={data.code.document} />

<div class="prose-learn">
	<p><dfn>Language</dfn> は「このパスは自分が扱う」と答えるだけのトレイトです。最初に名乗り出た言語が文書を受け持ちます。</p>
</div>

<Code item={data.code.language} />
<Code item={data.code.regDocument} />

<div class="prose-learn">
	<H2 id="tasks" />
	<p>
		<dfn>Task</dfn> は文書一つで完結する処理です。compile、format、lint がそうです。<code>applies</code>
		で自分の文書かを判断し、<code>run</code> で結果を <code>TaskOutput</code> に書きます。
	</p>
</div>

<Code item={data.code.task} />
<Code item={data.code.taskOutput} />

<div class="prose-learn">
	<p>
		型検査は事情が違います。一つのコンポーネントの型は、それが import する他のファイルに依存します。上流の svelte-check
		も、全ファイルを一つの TypeScript プロジェクトとして検査します。そこで型検査は <dfn>ProjectTask</dfn>
		として二つに分けます。
	</p>
</div>

<Code item={data.code.projectTask} />
<Code item={data.code.part} />

<div class="prose-learn">
	<p>
		<code>prepare</code> は文書のワーカーの上で、その文書の <code>Ctx</code> を使って走ります。ここで必要なものを
		<code>Part</code> として取り出します。<code>Part</code> は所有権を持つ値でなければなりません。<code>finish</code>
		が走るころには、文書の <code>Ctx</code> はもうないからです。
	</p>
	<p>
		Svelte の型検査では、<code>prepare</code> が TypeScript への射影を作り、生成したテキストと写像を
		<code>Part</code> に入れます。<code>&lt;script lang="ts"&gt;</code> を持たない文書は、svelte-check
		も意味の診断を出さない（<code>checkJs</code> が無効）ので、ここで空の結果を書いて <code>None</code>
		を返し、プロジェクトパスを待ちません。
	</p>
</div>

<Code item={data.code.checkPrepare} mark={['Ok(Projection::Js) =>', 'Some(Box::new(Prepared {']} />

<div class="prose-learn">
	<H2 id="registry" />
	<p>
		走らせるタスクは <code>RunOptions::tasks</code> で選びます。空なら全部です。
	</p>
</div>

<Code item={data.code.runOptions} />
<Code item={data.code.selected} />

<Caution>
	<code>selected</code> は、登録されていない ID を黙って無視します。ID を打ち間違えると、何も走らずに成功します。CLI
	は自分で ID を確かめてから渡していますが、カーネルの API としては防げていません（<a href="/learn/polish#contracts"
		>13 磨きどころ</a
	>）。
</Caution>

<div class="prose-learn">
	<H2 id="run-document" />
	<p>
		文書一つの処理は <code>run_document</code> です。<a href="/learn/kernel#life">01 全体像</a>で見たとおり、<code>Ctx</code>
		を作り、タスクを登録順に走らせ、続けてプロジェクトタスクの <code>prepare</code> を走らせます。
	</p>
</div>

<Code item={data.code.runDocument} mark={['catch_unwind', 'parts.push((k, outputs.len(), part))', 'panic: Some(panic_message(e))']} />

<div class="prose-learn">
	<p>
		全体は <code>catch_unwind</code> で包まれています。どこかのタスクが panic しても、止まるのはその文書だけで、他の文書の処理は続きます。panic
		した文書は、他のタスクの出力も含めてすべて捨て、メッセージだけを残します<Note
			>一部のタスクの出力だけを返すと、呼び出し側は「panic したタスク以外は正しい」と読むかもしれません。全部捨てるほうが誤解がありません。</Note
		>。
	</p>
</div>

<Code item={data.code.panicMessage} />

<div class="prose-learn">
	<p>
		panic のペイロードが <code>String</code> でも <code>&amp;str</code> でもないときは、メッセージは空文字列になります。<code
			>std::panic::panic_any</code
		>
		で任意の値を投げた場合がそうです。
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
		ポイントは、メモリのピークが<strong>コーパスの大きさ</strong>ではなく<strong>同時に処理中の文書</strong>で決まることです。ただし、部品を持つ文書だけはプロジェクトパスまで待たされ、そのあいだ結果を持ち続けます。
	</p>
	<p>
		実測でも効果ははっきり出ています。{data.docs.toLocaleString('en-US')} 文書で、全結果を集めたときの生存ヒープのピーク増分は {mb(data.shared.peak)}
		MB、<code>run_each</code> で結果をすぐ捨てたときは {mb(data.streaming.peak)} MB でした。時間の中央値は {data.shared.plain[0].toFixed(
			1
		)} ms と {data.streaming.plain[0].toFixed(1)} ms で、ほとんど変わりません。
	</p>

	<DeepDive title="待たされる文書が持っているもの">
		<p>
			待機リストに入るのは <code>DocResult</code> の全体です。<code>parts</code> だけでなく、同じ文書の compile や format の出力（<code
				>outputs</code
			>）も一緒に保持されます。プロジェクトパスが要るのは部品と、その文書の型検査の出力の置き場所だけなので、他のタスクの出力は先に
			sink に渡せるはずです。今は、型検査を選んだときに TypeScript の文書が多いほど、ストリーミングの効果が薄れます。
		</p>
	</DeepDive>

	<H2 id="project" />
	<p>
		並列パスが終わると、待たせていた文書を元の順に並べ直し、プロジェクトタスクごとに <code>finish_project</code> を一回呼びます。
	</p>
</div>

<Code item={data.code.finishProject} />

<div class="prose-learn">
	<p>
		少し込み入っているのは、借用の都合です。<code>finish</code> には、部品と、その部品の持ち主の
		<code>TaskOutput</code> への可変参照を、同じ順で渡す必要があります。そこで、全文書の出力への参照を
		<code>Option</code> の表（<code>by_doc</code>）にしてから、持ち主の分だけ <code>take</code>
		で取り出しています。部品の仕分けは、プロジェクトタスクごとに全文書の <code>parts</code> を <code>partition</code>
		し直しています。
	</p>
	<p>
		<code>finish</code> が panic したときは、部品を出したすべての文書を panic 扱いにします。どの文書のせいかは分からないからです。
	</p>
	<p>カーネルのテストは、プロジェクトタスクが部品を出した文書をちょうど一回ずつ見ることを確かめています。</p>
</div>

<Code item={data.code.test} />

<div class="prose-learn">
	<H2 id="run" />
	<p>
		結果をまとめて受け取りたい呼び出し側のために、<code>run</code> があります。中身は <code>run_each</code>
		で、<code>sink</code> が文書の番号の slot に結果を置くだけです。つまり、ストリーミングが基本で、収集はその上の便利関数です。
	</p>
</div>

<Code item={data.code.run} />

<div class="prose-learn">
	<p>
		スレッド数を指定すると、<code>in_pool</code> がその数のスレッドプールを作ります。指定しなければ rayon
		の既定（コア数）です。1 スレッドのときの中央値は {data.serial.plain[0].toFixed(1)} ms で、既定の
		{data.shared.plain[0].toFixed(1)} ms の約 {(data.serial.plain[0] / data.shared.plain[0]).toFixed(1)} 倍でした。
	</p>
</div>

<Code item={data.code.inPool} />

<ChapterFooter chapter={c} />
