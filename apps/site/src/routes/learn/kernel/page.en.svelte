<script lang="ts">
	import Term from '$lib/components/Term.svelte';
	import KernelModuleFigure from '$lib/widgets/KernelModuleFigure.svelte';
	import KernelOverview from '$lib/widgets/KernelOverview.svelte';
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import DeepDive from '$lib/components/DeepDive.svelte';
	import Figure from '$lib/components/Figure.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const c = chapter('kernel', 'en');

	const life = [
		{ functionName: 'Registry::document', label: 'Create a document that holds the original source', what: 'Stores the path and the source text in Document and checks the size limit. At this point there is no syntax tree and no analysis result.', href: '/en/learn/kernel/pipeline#document' },
		{ functionName: 'run_each', label: 'Run the selected tasks for each document', what: 'Picks the tasks to run by their identifiers and hands the documents to rayon workers. Each task decides from the path or the content whether the document is its input.', href: '/en/learn/kernel/pipeline#run-each' },
		{ functionName: 'run_document', label: 'Prepare the store for each document', what: 'Creates DocumentContext when the first task runs. It refers to the original document and prepares the place to store computed results. No parsing happens at this point.', href: '/en/learn/kernel/pipeline#run-document' },
		{ functionName: 'Task::run / DocumentContext::get', label: 'Build trees and analysis results when they are needed', what: 'Each task asks for the computed results it needs with DocumentContext::get. Parsing, name resolution, building the tree for compiling, and language-specific analysis happen only when they are needed. A computed result is stored, and later tasks reuse it.', href: '/en/learn/kernel/database#get' },
		{ functionName: 'TaskOutput', label: 'Store the compile, format, and lint results', what: 'Compiling creates files in the format that the language plugin defines. Formatting returns the rewritten source, and linting returns errors and warnings. The output goes into TaskOutput and is kept apart from the original syntax tree and analysis results.', href: '/en/learn/kernel/emitter' },
		{ functionName: 'FinishTask::prepare', label: 'Build the per-document data for type checking', what: 'If type checking is also selected, it asks the same per-document store for the code and position mappings for type checking. For a plugin that type checks with TypeScript, the code for checking is built from the original syntax tree. prepare puts that text, the position mapping table to the original source, the type declaration settings, and a copy of the original source into a Part. It does not use the compiled JavaScript.', href: '/en/learn/kernel/pipeline#tasks' },
		{ functionName: 'FinishTask::finish', label: 'Collect the per-document data and type check it', what: 'After every document is processed, the Part values are collected for each task, and the TypeScript compiler checks the types. The position of each finding is mapped back to the original source and added to the TaskOutput of its document. The per-document stores are already freed at this point.', href: '/en/learn/kernel/pipeline#project' },
		{ functionName: 'sink', label: 'Pass each finished document to the caller', what: 'A document that returned no Part goes to sink right after it is processed. A document that returned a Part goes to sink after finish. The caller receives the files and diagnostics in TaskOutput.', href: '/en/learn/kernel/pipeline#run-each' }
	];
	const structures = [
		{ name: 'Document', content: 'The file path and the original source text. It has no language and no syntax tree.', lifetime: 'While the document is processed. The per-document store refers to it.' },
		{ name: 'Syntax tree (a type for each language)', content: 'The tree that the language plugin builds from the source, and the tokens, including whitespace and comments. If the file has an embedded language, its syntax tree is kept too.', lifetime: 'Built at the first request, and kept in the cache of the per-document store.' },
		{ name: 'Analysis tables (a type for each language)', content: 'Analysis results, such as which declaration a variable refers to. They live in separate tables, looked up by node or binding identifiers, so the original syntax tree does not change.', lifetime: 'Only the needed ones are built, and they are kept in the per-document store.' },
		{ name: 'Lowered tree (a type for each language)', content: 'A tree rebuilt into a form that suits the output step. It is built apart from the original syntax tree and keeps the link to the original syntax.', lifetime: 'Built when needed, and kept in the per-document store.' },
		{ name: 'TaskOutput', content: 'The names and text of the generated files, and the errors and warnings. Kept apart from the syntax tree and the analysis tables.', lifetime: 'Kept after the document is processed, and passed to sink when all results are ready.' },
		{ name: 'Part (for type checking)', content: 'The TypeScript for type checking, the position mapping table to the original source, the type declaration settings, and a copy of the original source. It does not keep references to the syntax tree.', lifetime: 'Built by prepare, and received by finish after every document is processed.' }
	];
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="The kernel holds the features that every language shares, such as storing parse results and running work. Language plugins register the work that belongs to one language, such as parsing and compiling. This chapter explains the role of each module and the steps from input to output."
/>

<div class="prose-learn">
	<H2 id="why" />
	<p>
		Suppose you compile a source file and also select formatting, linting, and type checking. If each of them starts its own parse, the same work runs several times.
		If they can share the syntax trees and analysis results they need, a value computed once can be reused.
	</p>
	<p>
		Some mechanisms do not depend on the language, such as converting a source position to a line and a column, or storing computed results.
		The shape of the syntax tree and the rules for where a variable can be referenced differ by language, so the language plugin decides them.
		Reporting errors and warnings, building output text, and mapping generated code back to the source are also shared.
		rsvelte puts these into one Rust library. That library is the kernel.
	</p>
	<p>
		We split the code by one rule: <strong>if the language changes, do the rules of the work change too?</strong> Code that does not need a rewrite goes into the kernel. This includes the scheduler, the cache of computed results, the code that finds the original source position, and the printer for code formatting. How lint rules run and how their findings are ordered belongs to rsvelte_lint, not to the kernel.
	</p>
	<p>
		We tested this rule by adding a second language (see <a href="#languages">The second language</a>).
	</p>

	<H2 id="overview" />
	<p>
		The next figure shows what the language plugins, the kernel, and the host register, and the order in which they pass data. Each box links to the chapter that explains that part.
		Each later chapter starts by showing its position in this figure.
	</p>
</div>

<KernelOverview />

<div class="prose-learn">
	<p>
		The language plugins on the left of the figure register two things: the types of computed results, such as syntax trees and name resolution, and tasks such as compiling and formatting.
		The host creates the documents and starts the kernel run. The kernel calls the tasks for each document, and computes and stores each result that a task asks for only once.
		When every document is prepared, the kernel calls a project task, a step over all documents such as type checking, only once.
	</p>

	<H2 id="layers" />
	<p>Dependencies go in one direction. The lower a layer is, the farther it is from any language.</p>
</div>

<Figure label="Figure 1.2 · Roles of the crates and the direction of dependencies">
	<div class="overflow-x-auto px-4 py-5">
		<ol class="flex min-w-[640px] items-stretch gap-2 font-mono text-[12.5px] tracking-normal">
			{#each [['rsvelte_command_line · rsvelte_kernel_browser', 'Hosts: the command line and the browser'], ['rsvelte_svelte_compile · rsvelte_vue_lint · rsvelte_svue, and others', 'Language tools: compiling, formatting, linting, type checking, and translation between languages'], ['rsvelte_svelte · rsvelte_vue · rsvelte_typescript, and others / rsvelte_lint, and others', 'Language cores, and shared parts'], ['rsvelte_kernel', 'Knows no language']] as [name, role], i (name)}
				<li class="flex flex-1 items-center gap-2">
					<div class={['flex-1 rounded-sm border px-3 py-2', i === 3 ? 'border-fg bg-surface' : 'border-line-strong']}>
						<div class="font-medium text-fg">{name}</div>
						<div class="mt-0.5 text-[11.5px] text-muted">{role}</div>
					</div>
					{#if i < 3}<span class="text-muted" aria-hidden="true">→</span>{/if}
				</li>
			{/each}
		</ol>
	</div>
	{#snippet caption()}The arrows show the direction of dependencies. The role of a crate comes from its path, and a test in <code>tools/structure</code> checks the direction of dependencies. A language core depends only on the kernel and on other language cores. A shared part depends only on the kernel. rsvelte_svue and rsvelte_svelte_compile_vapor depend on both the Svelte core and the Vue core. The kernel depends on five external crates: rayon, semver, rustc-hash, sha2, and unicode-width.{/snippet}
</Figure>

<div class="prose-learn">
	<p>
		The comment at the top of the kernel's <code>lib.rs</code> lists what the kernel holds. As the figure above shows, a test in <code>tools/structure</code> checks the rule for the direction of dependencies.
	</p>
	<blockquote class="border-l-0 font-mono text-[14px] leading-[1.7] text-fg-2">{data.libDocs}</blockquote>
	<p>
		A plugin registers result types and tasks in <code>Registry</code>. Each language decides how many types and tasks it registers.
		The <code>register</code> function of the Svelte plugin below registers computed results such as syntax trees and name resolution.
		Each tool registers its own tasks, such as compiling and formatting.
		Chapter <a href="/en/learn/kernel/database#facet">04</a> explains the shared interface that receives results in the same form from several languages.
	</p>
</div>

<Code item={data.code.register} />

<div class="prose-learn">
	<p><code>Registry</code> receives the registrations. It holds the registered tasks and project tasks, the computed results and shared interfaces, and the plugin declarations.</p>
</div>

<Code item={data.code.registry} />

<div class="prose-learn">
	<H2 id="modules" />
	<p>
		The host creates documents and passes the selected tasks to the kernel. A language plugin asks for the syntax trees and analysis results it needs, and returns output.
		The kernel modules support this running and storing.
	</p>
</div>

<Figure label="Figure 1.3 · The run flow that every language shares">
	<ol class="grid gap-3 p-5 sm:grid-cols-3">
		<li><strong>1. Create documents</strong><p>The host passes paths and source text.</p></li>
		<li><strong>2. Run tasks</strong><p>The language plugin asks for the computed results it needs, and they are reused within each document.</p></li>
		<li><strong>3. Return output</strong><p>The generated files and diagnostics go to the caller.</p></li>
	</ol>
	{#snippet caption()}Work that also needs other documents runs after the data for each document is prepared, all at once. The language plugin decides the type of the syntax tree and the output format.{/snippet}
</Figure>

<div class="prose-learn">
	<p>
		The kernel part for registering and running work calls the selected work for each document, in order.
		The part for storing and reusing computed results keeps the syntax trees and name resolution tables that the language plugin builds.
		Formatting uses the printer for code formatting. Linting uses the rule runner and the finding writer of rsvelte_lint, and uses the error and warning types and the position conversion from the kernel.
		Compiling and generating code for type checking use text output and position mapping.
	</p>
	<p>
		For example, when you type check with TypeScript, the code for checking, the position mapping table, the type declaration settings, and a copy of the original source are prepared first. Then the syntax trees and analysis results of each document are freed.
		When every document is prepared, the type checker parses the TypeScript and checks the types.
		The position mapping table maps each finding back to the original source, and the findings go to the caller together with the formatting, linting, and compiling output.
	</p>
</div>

<details class="my-8">
	<summary class="cursor-pointer text-[14px] font-medium text-fg-2">Show the kernel modules and implementation files</summary>
	<KernelModuleFigure modules={data.modules} />
</details>

<div class="prose-learn">
	<p>
		The implementation has {data.modules.length} modules<Note>
			<code>lib.rs</code> holds only <code>pub mod</code> lines and re-exports, so it is not counted.</Note
		>. Open "Show the kernel modules and implementation files" to see the list grouped by role. The "Implementation files and line counts" part of each group gives a description and a line count for each file. The line counts include tests and are counted again at each build.
	</p>

	<H2 id="life" />
	<p>
		This section follows one document with compiling, formatting, linting, and type checking selected.
		The plugin decides the types of the syntax tree and the analysis results. The <code>Part</code> here is the example of type checking with TypeScript.
		First, here is the data that the kernel keeps. The kernel stores the computed results of each document in <Term name="DocumentContext" />,
		and keeps the syntax trees and analysis results there, separated by the type of each result.
	</p>
	<table class="table">
		<thead><tr><th>Data</th><th>Contents</th><th>When it is kept</th></tr></thead>
		<tbody>
			{#each structures as structure (structure.name)}
				<tr><td><code>{structure.name}</code></td><td>{structure.content}</td><td>{structure.lifetime}</td></tr>
			{/each}
		</tbody>
	</table>
	<p>
		An analysis table is, for example, a mapping from the number of an identifier to the declaration it refers to.
		Instead of writing analysis marks into the tree itself, the kernel stores them in a separate table. The syntax tree organized for compiling is not a mapping table. It is a separate tree built from the syntax tree.
	</p>
	<p>
		Here is the run flow. <code>Task::run</code> calls <Term name="DocumentContext::get" />, so trees and tables are computed at the moment a task needs them.
		The kernel does not finish every analysis before the first task starts.
	</p>
</div>

<ol class="my-8 border-l border-line-strong">
	{#each life as step, i (step.functionName)}
		<li class="relative pb-5 pl-6 last:pb-0">
			<span class="absolute top-[0.55em] -left-[4.5px] h-2 w-2 rounded-[1px] bg-fg" aria-hidden="true"></span>
			<div class="flex flex-wrap items-baseline gap-x-3">
				<span class="font-mono text-[12px] tracking-normal text-muted">{i + 1}</span>
				<a href={step.href} title="Name in code: {step.functionName}" class="text-[14px] hover:text-accent">{step.label}</a>
			</div>
			<p class="mt-1 text-[15.5px] leading-[1.75] text-fg-2">{step.what}</p>
		</li>
	{/each}
</ol>

<div class="prose-learn">
	<p>
		In the current implementation, compile, format, and lint run first for a document, and the type check's <code>prepare</code> runs after them.
		If compile is also selected, the JavaScript and the style sheet already exist at this point.
		The type check does not check that generated code. It checks TypeScript that is built separately from the original syntax tree.
		The current compile step does not take the project-wide type check results as input.
	</p>
	<p>
		If only compile is selected, the type check's <code>prepare</code> and <code>finish</code> do not run.
		If only type checking is selected, the run starts with parsing and generating the TypeScript, and builds no compile output.
		Compiling with information from other files would need a separate stage that gathers that information before compiling.
	</p>
	<p>
		When <code>run_document</code> returns, <Term name="DocumentContext" /> is freed, together with the syntax trees, the trees organized for compiling, and the analysis tables in it.
		What waits for <code>finish</code> is the output and the <code>Part</code>, which owns its data. The type check does not read the document again or parse the syntax tree again.
	</p>
</div>

<Code item={data.code.runDocument} mark={['shared.get_or_init(|| DocumentContext::new', 'catch_unwind', 'own = isolated()']} />

<div class="prose-learn">
	<p>
		With <code>Sharing::Shared</code>, every task uses the same <code>shared</code>, so the same parse result is computed only once per document. <code
			>Sharing::Isolated</code
		>
		gives each task its own new instance of <Term name="DocumentContext" />. It is not for the product. It is for comparison, to measure how much sharing helps. <code>shared</code>
		is created when a task first asks for it, so it is never created when each task computes on its own.
	</p>

	<DeepDive title="Why parallelize by document">
		<p>
			When the unit of parallel work is a document, all computation for one document stays on one worker. Because of this, <Term name="DocumentContext" />
			needs no lock for synchronization (<code>!Sync</code>), and a computed result only needs to go into a <code>OnceCell</code>.
		</p>
		<p>
			The tasks run back to back, so compile, format, and lint read the same tree while the parse result is still in the cache. The cost is that one very large document cannot use several cores. The documents in the test corpus are small, so this tradeoff fits for now.
		</p>
	</DeepDive>

	<H2 id="languages" />
	<p>
		You can only know whether the kernel really knows no language after you add a second language. <code>rsvelte_vue</code> is a plugin for Vue
		single-file components that we added to test this. It uses the same mechanism as Svelte and stores the following computed results for each document.
	</p>
	<table class="table">
		<caption class="mb-3 text-left text-[14px] text-fg-2">Computed results that the Vue plugin stores</caption>
		<thead><tr><th scope="col">Role</th><th scope="col">What it stores</th></tr></thead>
		<tbody>
			<tr><th scope="row">Parsing (<code>Parsed</code>)</th><td>The syntax trees of the script, the template, and the style. If parsing fails, the error.</td></tr>
			<tr><th scope="row">Tree for compiling (<code>Lowered</code>)</th><td>The template, converted into the structure that the Vue compiler works with.</td></tr>
			<tr><th scope="row">Name resolution (<code>Resolved</code>)</th><td>The links between variable declarations and references, and the kind of each binding in the script.</td></tr>
		</tbody>
	</table>
	<p>The Vue plugin registers its results in the same shape as Svelte.</p>
</div>

<Code item={data.code.vueRegister} />
<Code item={data.code.vueParsed} />

<div class="prose-learn">
	<p>
		The Vue plugin has four kinds of work: compiling, formatting, linting, and type checking.
		Compiling matches the official Vue plugin, formatting matches Prettier, and linting matches the output of ESLint.
		For type checking, it generates code in the same shape as vue-tsc.
		JavaScript parsing and output, and style sheet processing, are shared with Svelte.
	</p>
	<p>
		These are the things we added for the second language (573ac584b6, a15cdcda04). The first one went into rsvelte_typescript, and the rest went into the kernel. None of them is specific to Vue. Svelte uses them too.
	</p>
	<ul>
		<li>
			Scopes that the host opens: scope analysis (<code>rsvelte_typescript</code>) takes, as a tree, the root that the host language passes. Vue's
			<code>v-for</code> is a scope that the template opens.
		</li>
		<li>Diagnostics with no end: some ESLint reports have only one position, and the lint writer writes their end as <code>null</code>.</li>
		<li>A 256-bit hash function: the kernel's <code>sha256</code>. It makes the identifiers of Vue styles the same values that the official plugin makes.</li>
		<li>
			Shared interfaces: a way for one task to ask a question that each language answers in its own way, as in type checking (Chapter <a href="/en/learn/kernel/database#facet">04</a
			>).
		</li>
	</ul>
	<p>
		The two plugins can also be combined to translate a component of one language for the runtime of the other. <code>rsvelte_svue</code> compiles a
		<code>.vue</code> component for the Svelte runtime, with Vue semantics. It uses the Vue parser and name resolution, and the Svelte
		compiler, as they are. The only part it owns translates the Vue syntax tree into a script that uses Svelte runes and into the syntax tree organized for compiling. <code
			>rsvelte_svelte_compile_vapor</code
		> goes the other way: it compiles a <code>.svelte</code> component for the Vue runtime, with Svelte semantics (Chapter <a href="/en/learn/kernel/layers#svue"
			>05</a
		>).
	</p>
	<p>Crate sizes (Rust lines in <code>src/</code>, including tests, counted again at each build):</p>
</div>

<figure class="my-8 overflow-x-auto">
	<table class="table">
		<thead><tr><th>Crate</th><th class="num">Files</th><th class="num">Lines</th></tr></thead>
		<tbody>
			{#each data.crates as cr (cr.name)}
				<tr><td><code>{cr.name}</code></td><td class="num">{cr.files}</td><td class="num">{cr.lines.toLocaleString('en-US')}</td></tr>
			{/each}
		</tbody>
	</table>
</figure>

<div class="prose-learn">
	<H2 id="promises" />
	<p>The kernel code follows four promises. Each chapter shows where each one appears.</p>
	<ol>
		<li>
			<strong>No approximation.</strong> When a task meets syntax that is not ported yet, it does not produce output that only looks right. It reports <code>Unsupported</code>
			and writes no file. Approximate output would let lucky matches into the match rate (Chapter <a href="/en/learn/kernel/diagnostics#unsupported">07</a>).
		</li>
		<li>
			<strong>Positions are stored as u32.</strong> <code>Span</code> is 8 bytes and holds no file identifier. The context tells which document a position belongs to (Chapter <a href="/en/learn/kernel/source#span">02</a>).
		</li>
		<li>
			<strong>Compute once.</strong> Tasks do not call parsers directly. They ask for computed results (Chapter <a href="/en/learn/kernel/database">04</a>).
		</li>
		<li>
			<strong>Measurement is built in from the start.</strong> Computed results, tasks, and rules are all named phases. Without the <code>metrics</code>
			feature, no measurement code remains at all (Chapter <a href="/en/learn/kernel/measurement">11</a>).
		</li>
	</ol>
</div>

<ChapterFooter chapter={c} />
