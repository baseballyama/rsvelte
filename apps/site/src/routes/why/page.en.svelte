<script lang="ts">
	import ParseSharingFigure from '$lib/widgets/ParseSharingFigure.svelte';
	import ProjectFactsFigure from '$lib/widgets/ProjectFactsFigure.svelte';
	import SvelteSourceFigure from '$lib/widgets/SvelteSourceFigure.svelte';
	import { REPO_URL } from '$lib/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const sections = [
		{ id: 'whole-file', label: 'Parsing templates' },
		{ id: 'extensions', label: 'Custom lint rules' },
		{ id: 'sharing', label: 'Sharing analysis results' },
		{ id: 'project', label: 'Cross-file optimization' },
		{ id: 'today', label: 'Current status' }
	];
</script>

<svelte:head>
	<title>Why we build rsvelte — rsvelte</title>
	<meta name="description" content="Analysis that includes Svelte templates, custom lint rules, analysis results shared between tools, and cross-file optimization before compiling. This page explains the problems rsvelte wants to solve and what is implemented today." />
</svelte:head>

<main class="why">
	<header class="intro">
		<p class="eyebrow">Project goals</p>
		<h1>Why we build<br />rsvelte</h1>
		<p class="lead">rsvelte is a toolchain written in Rust. Lint, format, and compile share one Svelte syntax tree and one set of name resolution results. The goal is that custom rules and the compiler can use analysis results that include variable references and bindings in the template.</p>
		<p>The first target is runes mode in Svelte 5. Parsing, caching of analysis results, and registering and running tasks are shared. This removes repeated parsing in each tool and repeated analysis work in custom rules. The implementation is experimental.</p>
		<div class="premise"><span>What this page covers</span><p>The page explains template analysis, registering custom rules, and sharing the cache between tasks, in that order. Cross-file optimization is a design that is not implemented. The figures are models of data dependencies and decision rules, not measured values.</p></div>
	</header>

	<nav class="contents" aria-label="Contents of this page">
		{#each sections as section, index}<a href="#{section.id}"><span>0{index + 1}</span>{section.label}</a>{/each}
	</nav>

	<section id="whole-file">
		<p class="eyebrow">01 · Language coverage</p>
		<h2>Oxlint does not parse<br />Svelte templates</h2>
		<p>In Svelte, the template can refer to variables that the script declares. In the example below, the expression <code>&#123;name&#125;</code> reads a variable, and <code>bind:value=&#123;name&#125;</code> also writes to it on input events. To analyze this relation, you need the Svelte template syntax tree and name resolution, in addition to the JavaScript syntax tree.</p>
		<SvelteSourceFigure markup={data.examples} />
		<p>Oxc is a set of tools that parse and transform JavaScript and TypeScript. Oxlint can check the script part of Svelte and Vue files. However, the official support table lists template checks as not supported. Oxfmt needs <code>svelte/compiler</code> as an extra dependency to format Svelte. You can confirm this in the <a href="https://oxc.rs/compatibility">official support table</a> and in <a href="https://oxc.rs/docs/guide/usage/linter">what Oxlint covers</a>.</p>
		<p>Analysis of the declarations in the script alone does not tell you what the template reads or writes. To check variable usage, valid bindings, and unused styles, the analysis must include the template.</p>
		<p>rsvelte keeps syntax trees for JavaScript, the template, and styles. Name resolution matches each identifier in the template to a declaration in the script or to a local variable in the template. Scopes and reference targets are stored in tables separate from the syntax trees, and lint and compile both use them. We put Svelte-specific semantic analysis before broad coverage of general JavaScript rules.</p>
		<p class="reading">Design details: <a href="/en/learn/kernel/layers">how syntax trees and analysis results are stored</a></p>
	</section>

	<section id="extensions">
		<p class="eyebrow">02 · Extensibility</p>
		<h2>Give custom lint rules<br />the template and name resolution</h2>
		<p>Take a custom rule like this one: "form submissions use only the SubmitButton imported from a given module." A match on the tag name alone cannot tell this component from another component with the same name. The rule needs the template elements and name resolution to the import declaration.</p>
		<p>ESLint has a <a href="https://eslint.org/docs/latest/extend/custom-rules">system for custom rules</a>, and Oxlint supports plugins written in JavaScript. Adding a rule and giving that rule the syntax tree and semantic analysis of the target language are two separate conditions. The <a href="https://oxc.rs/docs/guide/usage/linter/js-plugins#api-support">plugin support list for Oxlint</a> says that custom file formats such as Svelte and Vue, and their parsers, are not supported.</p>
		<div class="extension-flow" aria-label="Inputs and outputs of a custom rule">
			<div><span>Existing language plugin</span><strong>Template syntax tree and name resolution</strong></div><b aria-hidden="true">→</b>
			<div><span>Work you add</span><strong>Custom lint rule</strong></div><b aria-hidden="true">→</b>
			<div><span>Result for the user</span><strong>Diagnostics with source ranges</strong></div>
		</div>
		<p>In rsvelte, you register a Rust task, and it can get the existing parse results and name resolution results. A custom check reads that data, decides whether a condition holds, and returns diagnostics. The analysis results it needs come from a cache for each document, so the rule does not need its own parser or name resolution.</p>
		<p>Each syntax tree node keeps its range in the original source. A diagnostic uses that range, and shared output code converts it to a line and a column. A new language plugin also reuses source handling, the cache, diagnostics, and the scheduler.</p>
		<div class="premise"><span>Extensions available today</span><p>Today, you extend rsvelte with tasks and analysis written in Rust and linked statically into the host program. There is no way yet to load any plugin from a configuration file, and rules written for ESLint do not run as they are.</p></div>
		<p class="reading">A working example: <a href="/en/learn/plugins">write a plugin</a></p>
	</section>

	<section id="sharing">
		<p class="eyebrow">03 · Repeated parsing</p>
		<h2>Give the same Svelte syntax tree<br />to 4 kinds of work</h2>
		<p>When lint, format, and compile run in separate processes, each tool builds its own syntax tree from the source. The result of parsing Svelte for ESLint is usually not passed on to Prettier or the Svelte compiler. The same input is parsed again in each process.</p>
		<p>Existing tools can also share a syntax tree within one lint run, and they can cache results to skip unchanged files. What rsvelte shares is the syntax trees and analysis results that different kinds of tasks build from the same document.</p>
		<p>The example below selects format, lint, compile, and type check for the same Svelte file. The work for the document runs in order, and the type check runs after the type check TypeScript of every file is ready. Select a stage box to see its input and the data it builds.</p>
		<p>The figure separates the AST (abstract syntax tree), which keeps the structure of the source, from the HIR (high-level intermediate representation), which arranges the template for the compiler. Scopes and reference targets are stored in side tables keyed by the node's identifier number.</p>
		<div class="data-structures">
			<table>
				<caption>Main data structures that the pipeline keeps</caption>
				<thead><tr><th scope="col">Data structure</th><th scope="col">What it holds</th><th scope="col">Used by</th></tr></thead>
				<tbody>
					<tr><th scope="row">Source AST<br /><code>Component</code></th><td>Template nodes, the JavaScript/TypeScript AST, the style syntax tree, and the original source ranges. It also keeps the lexical tokens.</td><td>Formatting, HIR building, lint, and building the type check code.</td></tr>
					<tr><th scope="row">JavaScript/TypeScript AST<br /><code>SyntaxTree</code></th><td>The script and the JavaScript expressions in the template, stored in the same tree.</td><td>Scope and reference analysis, lint, and compile.</td></tr>
					<tr><th scope="row">Template HIR<br /><code>CompilerSyntaxTree</code></th><td>Nodes with branches and attributes arranged, parent and child links, and links to the original template. JavaScript expressions point to nodes in the JavaScript/TypeScript AST.</td><td>Scope and reference analysis, lint, and the analysis and render plan for compiling.</td></tr>
					<tr><th scope="row">Scope and reference side tables<br /><code>Resolution</code>, <code>Semantic</code></th><td>Scopes, declarations, reference targets, reads and writes, and Svelte-specific declaration kinds. They are stored in separate tables, not written into AST or HIR nodes.</td><td>Lint and compile.</td></tr>
					<tr><th scope="row">Analysis and render plan for compiling<br /><code>Analysis</code>, <code>RenderPlan</code></th><td>Expression dependencies, dynamic fragments, style matches, and the plan for the regions to render.</td><td>Building the output JavaScript AST and the styles.</td></tr>
					<tr><th scope="row">Output JavaScript AST<br /><code>LoweredModule</code></th><td>A new <code>SyntaxTree</code> built for the compile target. It is a different tree from the source AST.</td><td>Printing the JavaScript text.</td></tr>
					<tr><th scope="row">Type check text and position table<br /><code>TypeScriptDocument</code>, <code>Emitter</code></th><td>TypeScript built from the source AST, and the map from it to positions in the original Svelte. This data is separate from the template HIR and the output JavaScript AST.</td><td>The external type checker, and mapping diagnostic positions back.</td></tr>
				</tbody>
			</table>
		</div>
		<ParseSharingFigure markup={data.pipeline} />
		<p>In the figure, the "Build scopes and resolve references" stage matches identifiers to declarations. It also builds this data:</p>
		<ul>
			<li>Scope table: the scopes that functions, blocks, and template blocks such as <code>&#123;#each&#125;</code> create, and their parent and child links.</li>
			<li>Declaration table: declarations of variables and imports, and the scope each one belongs to. For Svelte, it also records the declaration kind, such as <code>$state</code> or props.</li>
			<li>Reference table: the target of each identifier, and whether it is read or written. Writes from the template, such as <code>bind:value</code>, are analyzed too.</li>
		</ul>
		<p>Control flow analysis is a separate kind of work. The paths that run through branches and loops are different information from the scope that an identifier belongs to. Work that checks reachability or the assignment state on each path needs control flow data. The scope and reference analysis in rsvelte does not build a control flow graph today. The type check passes the generated TypeScript to an external type checker, so the analysis inside that checker is not shared through the document context either.</p>
		<p class="reading">Implementation: <a href="{REPO_URL}/blob/experimental/crates/languages/typescript/core/src/semantic/scope.rs">scope and reference analysis in 2 passes</a> and <a href="{REPO_URL}/blob/experimental/crates/languages/svelte/semantic/src/semantic/resolve.rs">analysis of Svelte templates and runes</a></p>
		<p>A task asks the document's run context for an analysis result by its type. The first request computes the result, and later requests for the same result get the cached value. If you select only format, nothing requests the results for code generation. The dependencies come from the results that each computation requests.</p>
		<p>The shared syntax trees are immutable. The compile transforms build other syntax trees and do not change the original tree that lint and format read. We also do not print code as text in the middle and parse it again to continue the transform.</p>
		<p>The cache lives within a run context that processes one snapshot of one document. There is no persistent cache shared between separate commands, and no reuse of results from before an edit. These are not implemented. The external type checker reads the TypeScript built for the type check, so the toolchain as a whole still parses more than once.</p>
		<p>We measure the effect of sharing by comparing "shared" with "computed separately" for the same inputs and tasks. The <a href="/en/learn/measure#arms">measurement setup and results</a> are public. This comparison alone does not show that a whole application builds faster than with the official tools.</p>
	</section>

	<section id="project">
		<p class="eyebrow">04 · Future design</p>
		<h2>Analyze props from every caller<br />and optimize before Svelte compiles</h2>
		<p>Suppose a child component receives <code>tone</code> through <code>$props()</code>, and every caller passes <code>"quiet"</code>. The child's source alone cannot prove that the value is the same constant in every call. If you collect the callers' templates and the import resolution results, you can consider replacing the prop with a constant.</p>
		<p>The official <a href="https://svelte.dev/docs/svelte/svelte-compiler#compile">Svelte compile function</a> takes the source and options of one component. Its input does not include the imports of all modules or the props at each call site. So a normal compile of one component at a time cannot make optimizations that depend on every caller.</p>
		<ProjectFactsFigure />
		<p>In the design, each file's syntax tree and name resolution give a summary of its imports, its component call sites, and the props that each call passes. The summaries are joined across the whole project to decide whether every call of each component is known. When the constants match and the rewrite meets the safety conditions, a new syntax tree for compiling is built.</p>
		<ol class="project-flow">
			<li><span>Each file</span><strong>Summarize the call sites</strong><p>Record the import targets and the props passed.</p></li>
			<li><span>Whole project</span><strong>Join the summaries and decide</strong><p>Prove every call and the constant value.</p></li>
			<li><span>Before compiling</span><strong>Rewrite the Svelte syntax tree</strong><p>Keep the original tree and update the semantic analysis.</p></li>
			<li><span>After compiling</span><strong>Bundle the JavaScript</strong><p>Leave optimization of the generated code to Rolldown and Oxc.</p></li>
		</ol>
		<p>Rolldown and Oxc can optimize the generated JavaScript. But after code generation, the way Svelte receives props and its reactivity appear as calls to runtime functions. At the stage that rewrites the Svelte syntax tree directly, the analysis results give the props declarations and their references. There is no need to read generated code patterns backward to recover what the Svelte code meant.</p>
		<p>To make a prop constant, the design must still check assignments to props, <code>$bindable</code>, and the evaluation order and side effects of default values. With attribute spreads, dynamic component references, or exports to outside code, the value or the callers might be unknown. Unknown information is never a reason to optimize. The current design also does not remove <code>&#123;#if&#125;</code> branches that the constants would make dead.</p>
		<div class="premise"><span>Optimization not implemented and its effect not measured</span><p>This work is not implemented, and no gain in speed or output size has been measured. We plan to make it opt-in: a user turns it on explicitly. An implementation will be checked for equal rendered output, reactive updates, event order, and server rendering with hydration.</p></div>
		<p class="reading">Assumptions and counterexamples: <a href="{REPO_URL}/blob/experimental/docs/project.md#x4-cross-file-optimization--verdict-modify-opt-in-closed-components-only-provable-rewrites-only">design review of cross-file optimization</a></p>
	</section>

	<section id="today">
		<p class="eyebrow">05 · Current status</p>
		<h2>What is implemented<br />and what is only designed</h2>
		<p>If you already use Svelte tools, the first condition for a replacement is the syntax it supports and the correctness of its output. rsvelte is experimental, and some syntax in real source code is not supported. Speed alone is not a reason to choose it today.</p>
		<div class="status-grid">
			<div><span class="status-label">Implemented</span><h3>Sharing analysis results within a document</h3><p>Lint, format, and compile tasks can get the results that a language plugin stored.</p><a href="/en/learn/playground">Try the processing flow →</a></div>
			<div><span class="status-label">Built in with Rust</span><h3>Registering your own tasks</h3><p>An example shows a task that uses the existing parse results. Dynamic plugins for distribution are not available.</p><a href="/en/learn/plugins">Read the example →</a></div>
			<div><span class="status-label planned">Not implemented</span><h3>Cross-file optimization and a persistent cache</h3><p>The design is under review. Gains in real applications need an implementation and measurements first.</p><a href="{REPO_URL}/blob/experimental/docs/project.md">Read the design for the whole project →</a></div>
		</div>
		<p>For general JavaScript lint, Oxlint has its existing rules. For Svelte, there are the official compiler and checking tools. rsvelte mainly tests custom tasks that use template analysis results, and a cache shared between lint, format, and compile. Whether it can fully replace existing tools must be decided by comparing supported syntax and output.</p>
		<p>This project compares its output with the output of the official tools and publishes the results, including inputs that it rejects as not supported. Use the <a href="/en#ledger">current match status</a> and the <a href="/en/learn/measure">performance measurements</a> to decide whether rsvelte covers your case.</p>
	</section>

	<aside class="references" aria-labelledby="references-title">
		<h2 id="references-title">Sources and further reading</h2>
		<p>We checked the coverage of external tools against their official documents on October 2, 2026. Coverage changes over time, so check the linked pages too before you adopt a tool.</p>
		<ul>
			<li><a href="https://oxc.rs/compatibility">Support table for Oxlint and Oxfmt</a> / <a href="https://oxc.rs/docs/guide/usage/linter/js-plugins">custom plugins for Oxlint</a></li>
			<li><a href="https://eslint.org/docs/latest/extend/custom-rules">Custom rules for ESLint</a> / <a href="https://svelte.dev/docs/svelte/svelte-compiler">Svelte compile function</a></li>
			<li><a href="{REPO_URL}/blob/experimental/docs/concept.md">Design principles of rsvelte and the counterexamples we considered</a></li>
			<li><a href="{REPO_URL}/blob/experimental/docs/architecture.md">How the implementation is organized and measured</a> / <a href="{REPO_URL}/blob/experimental/docs/project.md">design of processing for the whole project</a></li>
		</ul>
	</aside>
</main>

<style>
	.why { max-width: 1080px; margin: 0 auto; padding: 64px 24px 0; }
	.intro { max-width: 780px; }
	h1 { margin: 20px 0 32px; font-size: clamp(42px, 7vw, 76px); line-height: 1.18; font-weight: 600; letter-spacing: 0.01em; }
	.lead { font-size: clamp(18px, 2vw, 22px); color: var(--fg); }
	p { font-size: 16px; line-height: 2; color: var(--fg-2); margin: 20px 0; overflow-wrap: anywhere; }
	a { color: var(--accent); text-decoration: underline; text-underline-offset: 4px; }
	a:hover { text-decoration-thickness: 2px; }
	.contents { display: flex; flex-wrap: wrap; gap: 12px 24px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 22px 0; margin: 48px 0 64px; }
	.contents a { font-size: 14px; color: var(--fg-2); text-decoration: none; }
	.contents span { margin-right: 8px; font-family: var(--font-mono); color: var(--accent); }
	section { scroll-margin-top: 90px; margin-top: 88px; }
	h2 { font-size: clamp(26px, 4vw, 38px); line-height: 1.5; font-weight: 600; margin: 12px 0 28px; }
	section > p { max-width: 760px; }
	.premise { border-left: 3px solid var(--border-strong); padding: 16px 22px; background: var(--sunken); margin-top: 28px; max-width: 780px; }
	.premise > span { font-size: 13px; font-weight: 600; }
	.premise p { font-size: 14px; margin: 8px 0 0; }
	.reading { font-size: 14px; }
	.data-structures { overflow-x: auto; margin: 28px 0; border: 1px solid var(--border); border-radius: 8px; }
	table { width: 100%; min-width: 650px; border-collapse: collapse; font-size: 13px; line-height: 1.8; }
	caption { padding: 16px; text-align: left; font-weight: 600; background: var(--sunken); }
	th, td { padding: 14px 16px; text-align: left; vertical-align: top; border-top: 1px solid var(--border); }
	th { font-weight: 600; }
	tbody th { width: 28%; }
	td { color: var(--fg-2); }
	.extension-flow { display: flex; align-items: center; gap: 14px; margin: 32px 0; }
	.extension-flow > div { flex: 1; border: 1px solid var(--border); border-radius: 8px; padding: 22px 16px; background: var(--sunken); }
	.extension-flow span, .project-flow span { display: block; color: var(--muted); font-size: 12px; margin-bottom: 8px; }
	.extension-flow strong { font-size: 14px; }
	.extension-flow b { color: var(--accent); }
	.project-flow { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; list-style: none; padding: 0; margin: 32px 0; counter-reset: phase; }
	.project-flow li { padding: 20px 16px; border-top: 2px solid var(--accent); background: var(--sunken); counter-increment: phase; }
	.project-flow li::before { content: '0' counter(phase); display: block; color: var(--accent); font-family: var(--font-mono); margin-bottom: 16px; }
	.project-flow strong { font-size: 14px; }
	.project-flow p { font-size: 13px; line-height: 1.8; margin-bottom: 0; }
	.status-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 32px 0; }
	.status-grid > div { border: 1px solid var(--border); border-radius: 10px; padding: 24px; }
	.status-label { font-size: 12px; color: var(--accent); }
	.status-label.planned { color: var(--muted); }
	h3 { font-size: 18px; line-height: 1.6; font-weight: 600; margin-top: 12px; }
	.status-grid p, .status-grid a { font-size: 14px; }
	.references { margin-top: 72px; padding-top: 28px; border-top: 1px solid var(--border); }
	.references h2 { font-size: 20px; }
	.references p, .references li { font-size: 13px; line-height: 2; }
	.references ul { list-style: disc; padding-left: 20px; }
	@media (max-width: 760px) { .why { padding: 40px 20px 0; } .status-grid { grid-template-columns: 1fr; } .extension-flow { flex-direction: column; align-items: stretch; } .extension-flow b { text-align: center; transform: rotate(90deg); } .project-flow { grid-template-columns: 1fr 1fr; } section { margin-top: 64px; } }
</style>
