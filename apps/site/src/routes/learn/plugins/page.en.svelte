<script lang="ts">
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import H2 from '$lib/components/H2.svelte';
	import { chapter } from '$lib/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const currentChapter = chapter('plugins', 'en');
</script>

<svelte:head><title>{currentChapter.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={currentChapter}
	lead="This chapter shows how to register your own computed results and tasks with the kernel and run them on documents. As a runnable example, you add a step that counts the elements in the syntax tree of an existing language plugin."
/>

<div class="prose-learn">
	<p>Registering and running work does not depend on the language. The example in this chapter uses the Svelte parser. Here, an element is a syntax tree node written as a tag. For another language, use that language's syntax tree and its check for which documents it handles.</p>
	<H2 id="boundary" />
	<p>A plugin is a library that registers Rust types and functions. The caller calls its registration function. The current implementation has no way to find and load a shared library at run time.</p>
	<table>
		<thead><tr><th>Goal</th><th>Entry point</th></tr></thead>
		<tbody>
			<tr><td>Parse the source yourself and use the result</td><td><code>rsvelte_svelte::syntax::parse::parse</code></td></tr>
			<tr><td>Share the parse result with other tasks</td><td><code>context.get::&lt;rsvelte_svelte::Parsed&gt;()</code></td></tr>
			<tr><td>Run your own work from the kernel</td><td>Register the computed result type and the task with <code>Registry</code></td></tr>
		</tbody>
	</table>
	<p>To use it from another Rust library, add <code>rsvelte_svelte</code> to the dependencies in <code>Cargo.toml</code>. The example that connects to the kernel also needs <code>rsvelte_kernel</code>. Inside this repository, use the workspace dependency settings. From outside, set <code>path</code> to the directory of each crate. The crates are not set up as published packages yet.</p>
	<p>The parse function returns <code>Result&lt;Component, Diagnostic&gt;</code>. The result is this project's own syntax tree. It holds the template, the JavaScript, the styles, and the tokens. Names and text refer to positions in the source, so keep the original source too. Syntax that is not supported yet gives an error.</p>
</div>

<Code item={data.code.parse} />

<div class="prose-learn">
	<H2 id="parsed" />
	<p>For a value that the kernel shares, implement <code>Artifact</code>, which defines a computed result. <code>Parsed</code> is not the result itself; it is a type that names where the result is stored. <code>Output</code> is the type of the stored value, and <code>compute</code> is the function that computes it. <code>NAME</code> is a name that measurements also use.</p>
</div>

<Code item={data.code.parsed} />

<div class="prose-learn">
	<p>Registration alone does not run the parser. The first <code>get::&lt;Parsed&gt;()</code> computes the result. After that, for the same document in the same run context, it returns the stored result. Errors are stored too. The return value is a reference, so a task borrows the syntax tree and reads it.</p>
	<p>The result is shared inside one <code>DocumentContext</code>. It is not kept for other documents or for the next run. <a href="/en/learn/kernel/database">04 Storing and reusing computed results</a> explains how results are stored.</p>
	<H2 id="artifact" />
	<p>From here on, you build a runnable example. You create <code>ElementCount</code>, which finds the number of elements recorded in the template. For the parse result, it uses the Svelte <code>Parsed</code>.</p>
</div>

<Code item={data.code.count} mark={['context.get::<Parsed>()']} />

<div class="prose-learn">
	<p>Getting another computed result inside <code>compute</code> declares a dependency. This example needs only the parse result. It does not call name resolution or code generation. It also does not need every registered result to be computed first.</p>
	<p>When parsing fails, it returns <code>None</code>. The original diagnostic stays in <code>Parsed</code>, and the task reports it. This keeps <code>Some(0)</code>, for a template with no elements, apart from a result that could not be computed.</p>
	<H2 id="task" />
	<p>For work that runs on each document, implement <code>Task</code>. A task gets the computed results it needs and passes its output to <code>TaskOutput</code>.</p>
</div>

<Code item={data.code.task} />

<div class="prose-learn">
	<ul>
		<li><code>identifier</code> is the name of the task. A run uses it to select tasks.</li>
		<li><code>applies</code> decides which documents the task handles. This example uses the Svelte check for file extensions.</li>
		<li><code>run</code> reports the parser's diagnostic, or writes the number of elements.</li>
	</ul>
	<p>After the task checks the parse result, counting the elements gets <code>Parsed</code> again. For the same document this reads the stored value, so the source is not parsed a second time. The task decides whether to report a diagnostic. Getting a computed result does not report its diagnostics by itself.</p>
	<p><code>output.file</code> adds a file name and its text to the result. It does not write to disk. Saving or showing the output is the caller's job.</p>
	<H2 id="register" />
	<p>The registration function is a normal Rust function that the plugin provides. This example registers the two computed results it uses and one task. The kernel does not register the types a result depends on by itself.</p>
	<p>
		A registration function that you ship also declares a name, a version, and dependencies as a <code>Plugin</code>, and registers it with <code>Registry::plugin</code>. Before they run, <code>run</code> and <code>run_each</code>
		check for missing dependencies, version mismatches, and cycles. This example leaves out the declaration.
	</p>
</div>

<Code item={data.code.register} />

<div class="prose-learn">
	<p>This registration does not include the Svelte compile or type check tasks. To use the standard tools too, call each tool's registration function on the same registry. For formatting, that is <code>rsvelte_svelte_format::register</code>. The registration of the language core declares the plugin, registers the parser, and registers the shared analysis results.</p>
</div>

<Code item={data.code.svelteRegister} />

<div class="prose-learn">
	<p>Registering the same computed result type again does not add more storage. Using the same computed result name for a different type is an error, and so is registering the same task name twice. Finish all registration before you run.</p>
	<H2 id="host" />
	<p>The caller creates the registry and passes the documents and the run settings. This example selects only the task it added.</p>
</div>

<Code item={data.code.host} />

<div class="prose-learn">
	<p>Run the example with the following command. It prints <code>elements.txt: 2</code>.</p>
	<pre><code>cargo run -p rsvelte_command_line --example plugin</code></pre>
	<p><code>Sharing::Shared</code> shares computed results between the tasks of the same document. <code>Sharing::Isolated</code> does not share them; it is used to measure the difference. Documents are processed in parallel, and the tasks for one document run in order.</p>
	<p>When <code>tasks</code> is empty, the run selects every registered task. An unknown task name is an error before the run starts. Normal diagnostics go into the output of each task, and a task that panics is recorded in <code>DocumentResult.panic</code>. The caller checks both.</p>
	<H2 id="extension" />
	<p>To add a new language, you also provide a check for which documents it handles, a parse result type, tasks, and a registration function. This example uses the Svelte results, so it leaves parsing to the existing <code>Parsed</code>. To use Svelte name resolution too, register that type as well.</p>
</div>

<Code item={data.code.resolved} />

<div class="prose-learn">
	<p>When several languages answer the same question, use <code>Facet</code>, which defines the shared question, and <code>Registry::provide</code>, which registers who answers it. Svelte registers a provider of <code>TypeScriptView</code>, which returns the code for type checking.</p>
</div>

<Code item={data.code.svelteTasks} />

<div class="prose-learn">
	<p>For work that also needs other documents, use <code>FinishTask</code>. Its <code>prepare</code> runs for each document and returns data that it owns. Its <code>finish</code> runs once and processes all of that data together. References borrowed from a document's run context cannot be kept until this step.</p>
	<p><a href="/en/learn/kernel/database#facet">04 One shared interface, one answer for each language</a> explains the storage side, and <a href="/en/learn/kernel/pipeline#tasks">06 Registering work and running it in parallel</a> explains how many documents are run. To try real registrations, use the <a href="/en/learn/playground">pipeline playground</a>.</p>
</div>

<ChapterFooter chapter={currentChapter} />
