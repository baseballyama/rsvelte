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
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const c = chapter('pipeline', 'en');
	const mb = (b: number) => (b / 1e6).toFixed(1);
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="This part runs what plugins registered over a set of documents. It processes documents in parallel and returns each result to the caller as soon as it is final. It also has a second pass for type checking, which needs other documents."
/>

<div class="prose-learn">
	<H2 id="document" />
	<p>
		A <dfn>Document</dfn> holds only a path and text. It is <code>#[non_exhaustive]</code>, so code outside the kernel can create one only with
		<code>Document::new</code> or <code>Registry::document</code>, and the length limit is always checked (Chapter <a
			href="/en/learn/kernel/source#loc">02</a
		>).
	</p>
</div>

<Code item={data.code.document} />

<div class="prose-learn">
	<p>The kernel does not decide the language of a document. It accepts unknown extensions and paths with no extension. Each plugin decides from the path or the content whether it handles a document, and several tasks can process one document. If no task applies, the result is empty.</p>
</div>

<Code item={data.code.regDocument} />

<div class="prose-learn">
	<H2 id="tasks" />
	<p>
		A <dfn>Task</dfn> is work that needs only one document. Compile, format, and lint are tasks. <code>applies</code>
		decides whether the task handles the document, and <code>run</code> writes the result to <code>TaskOutput</code>.
	</p>
	<p>Chapter <a href="/en/learn/plugins">15</a>, “Writing a plugin,” explains how to add your own work. It shows the steps to register computed results and tasks with a language plugin that you can run.</p>
</div>

<Code item={data.code.task} />
<Code item={data.code.taskOutput} />

<div class="prose-learn">
	<p>
		Some work needs other documents as well, so one document is not enough. For example, a type check also reads the declarations of the other files that a document refers to.
		Such work is a <dfn>FinishTask</dfn>. It is split into a preparation step for each document and a run over all collected documents.
	</p>
</div>

<Code item={data.code.finishTask} />
<Code item={data.code.part} />

<div class="prose-learn">
	<p>
		<code>prepare</code> runs on the worker of the document and uses <Term name="DocumentContext" /> of that document. It takes out what it needs as a
		<code>Part</code>. A <code>Part</code> must be an owned value, because <Term name="DocumentContext" /> of the document no longer exists when
		<code>finish</code> runs.
	</p>
	<p>
		In the current TypeScript type check, <code>prepare</code> runs after compile, format, and lint in the document.
		If compile is also selected, the document's JavaScript and style sheet already exist.
		The type check does not use that JavaScript as input. It builds a separate TypeScript text for type checking from the original syntax tree.
		So <code>prepare</code> is not a compile step: it prepares the data of each document for the type check.
		If only the type check is selected, the pipeline goes to this step without running compile.
	</p>
	<p>
		The project task for type checking exists only once, in <code>rsvelte_typescript_check</code>, not in each language plugin. A predicate passed to
		<code>matches</code> decides which documents it handles. One is registered for Svelte and one for Vue. The command line program also registers one that handles TypeScript, Svelte, and Vue together (<code>ts.check/default</code>).
	</p>
</div>

<Code item={data.code.check} />

<div class="prose-learn">
	<p>
		<code>prepare</code> gets the code for the type check through the shared interface (Chapter <a href="/en/learn/kernel/database#facet">04</a>).
		It stores the generated text, the original text, and the mapping between their positions in the <code>Part</code>.
		If the language plugin does not type check that document, it returns <Term name="TypeScriptDocument::Unchecked" />. Then <code>prepare</code> writes an empty result and returns <code>None</code>, so the document does not wait for the project-wide work.
	</p>
</div>

<Code item={data.code.checkPrepare} mark={['Ok(TypeScriptDocument::Unchecked) =>', 'Some(Box::new(Prepared {']} />

<div class="prose-learn">
	<H2 id="registry" />
	<p>
		<code>RunOptions::tasks</code> selects the tasks to run. If it is empty, all tasks run.
	</p>
</div>

<Code item={data.code.runOptions} />
<Code item={data.code.selected} />

<div class="prose-learn">
	<p>
		<code>selected</code> only filters by identifier, so an identifier that is not registered matches no task. Without a check, a run with a mistyped
		identifier would run nothing and still succeed. So <code>run_each</code> and <code>run</code> first check the plugin dependencies (<code>validate_plugins</code>) and then call <code>check_task_identifiers</code>.
		If an identifier is unknown, they run nothing and return <code>Err(UnknownTask)</code>. The command line program checks its arguments with the same function.
	</p>
</div>

<Code item={data.code.checkTaskIds} />

<div class="prose-learn">
	<H2 id="run-document" />
	<p>
		<code>run_document</code> processes one document. As Chapter <a href="/en/learn/kernel#life">01</a> showed, it creates <Term name="DocumentContext" />,
		runs the tasks in registration order, and then runs <code>prepare</code> of the project tasks.
	</p>
</div>

<Code item={data.code.runDocument} mark={['catch_unwind', 'parts.push((k, outputs.len(), part))', 'panic: Some(panic_message(e))']} />

<div class="prose-learn">
	<p>
		The whole run is wrapped in <code>catch_unwind</code>. If a task panics, only that document stops, and the other documents continue. For a document
		that panicked, all output is dropped, including the output of its other tasks, and only the message is kept<Note
			>The output of a document that ended abnormally may be wrong, even if some steps finished. Dropping the output of the whole document avoids returning an incomplete result.</Note
		>.
	</p>
</div>

<Code item={data.code.panicMessage} />

<div class="prose-learn">
	<p>
		The value passed to a panic is almost always a <code>String</code> or a <code>&str</code>, but <code>std::panic::panic_any</code>
		can throw any value. Even then, the message is not an empty string. It is a fixed sentence that says the panic had a value that is not a string. An empty message cannot tell a missing value from an empty value.
	</p>

	<H2 id="run-each" />
	<p>
		<code>run_each</code> is the main function that runs a set of documents. It uses rayon to spread the documents over threads, and passes each document whose result is final to
		<code>sink</code> right away. When <code>sink</code> returns, that result is freed.
	</p>
</div>

<Code item={data.code.runEach} mark={['if r.parts.is_empty()', 'sink(i, r);', '.push((i, r));']} />

<PipelineTimeline />

<div class="prose-learn">
	<p>
		The key point is that peak memory depends on <strong>the documents being processed at the same time</strong>, not on <strong>the size of the test corpus</strong>. The exception is documents that have parts. They wait for the project-wide work and keep their results until then.
	</p>
	<p>
		The measurements show the effect clearly. Over {data.docs.toLocaleString('en-US')} documents, the peak growth of live memory was {mb(data.shared.peak)}
		megabytes when all results were collected, and {mb(data.streaming.peak)} megabytes when <code>run_each</code> dropped each result at once. The median times were {data.shared.plain[0].toFixed(
			1
		)} ms and {data.streaming.plain[0].toFixed(1)} ms, almost the same.
	</p>

	<DeepDive title="What a waiting document holds">
		<p>
			The waiting list holds the whole <code>DocumentResult</code>. Besides <code>parts</code>, it also keeps the compile and format output (<code
				>outputs</code
			>) of the same document. The project-wide work needs only the parts and the place for the type check output of that document, so the output of other tasks could go to
			sink earlier. Today, when you select the type check, the more TypeScript documents there are, the smaller the benefit of streaming.
		</p>
	</DeepDive>

	<H2 id="project" />
	<p>
		When the parallel pass ends, the waiting documents are put back in their original order, and <code>run_finish_tasks</code> calls <code>finish</code> once for each project task.
	</p>
</div>

<Code item={data.code.finishTasks} mark={['by_task[k].push((d, o, part));']} />

<div class="prose-learn">
	<p>
		The slightly complex part comes from the borrowing rules. <code>finish</code> must get the parts and mutable references to the
		<code>TaskOutput</code> of each part's owner, in the same order. So the code first builds a table of references to every document's outputs as
		<code>Option</code> values (<code>by_doc</code>), and then uses <code>take</code>
		to remove only the owners' entries. The parts are scanned once at the start and sorted into one list for each project task. This sorting costs time in proportion to the number of parts. But for each project task that has parts, the code builds the table of all outputs again. So the total cost is in proportion to “project tasks with parts × outputs of all documents.”
	</p>
	<p>
		If <code>finish</code> panics, every document that gave a part to it is marked as panicked, because the code cannot tell which document caused the panic.
	</p>
	<p>
		The kernel tests check that a project task sees each document that gave a part exactly once, and that with two project tasks, each task gets only its own parts.
	</p>
</div>

<Code item={data.code.test} />
<Code item={data.code.testTwo} />

<div class="prose-learn">
	<H2 id="run" />
	<p>
		<code>run</code> is for callers that want all results at once. The earlier <code>run</code> was written on top of <code>run_each</code>,
		and its <code>sink</code> put each result into an array of <code>Mutex</code> values, one for each document. Now it collects the results in document order with rayon's
		<code>collect</code>.
	</p>
</div>

<Code item={data.code.run} mark={['let compile = |d| run_document(reg, d, &tasks, &finish_tasks, options.sharing);']} />

<div class="prose-learn">
	<p>
		The reason for the change is reproducible measurements. On macOS, a lock allocates memory the first time it is used, but on Linux it does not.
		So the allocation counts differed by the number of documents (17,512). Since the locks were removed, macOS
		and Linux report the same three numbers: allocations, bytes, and the peak of live memory (a5f67528cd). This agreement is what lets the performance baseline check compare allocation counts exactly (Chapter <a
			href="/en/learn/measure#ratchet">13</a
		>).
	</p>
</div>

<div class="prose-learn">
	<p>
		If you set the thread count to 2 or more, <code>in_pool</code> runs the work in a thread pool of that size. With 1, it creates no pool and processes the documents in order on the calling thread. The last pool used is kept while the process runs. So repeated runs with the same thread count reuse the threads and the buffer pools of those threads (Chapter <a
			href="/en/learn/kernel/buffer-pool">12</a
		>). If you do not set a count, rayon's default (the number of cores) is used. With 1 thread, the median was {data.serial.plain[0].toFixed(1)} ms, about {(data.serial.plain[0] / data.shared.plain[0]).toFixed(1)} times the
		{data.shared.plain[0].toFixed(1)} ms of the default.
	</p>
</div>

<Code item={data.code.inPool} />

<ChapterFooter chapter={c} />
