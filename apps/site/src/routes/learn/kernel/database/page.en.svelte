<script lang="ts">
	import Term from '$lib/components/Term.svelte';
	import Caution from '$lib/components/Caution.svelte';
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import DeepDive from '$lib/components/DeepDive.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import ArtifactCacheSim from '$lib/widgets/ArtifactCacheSim.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const c = chapter('db', 'en');
	const ms = (v: number) => v.toFixed(1);
	const m = (v: number) => (v / 1e6).toFixed(2);
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="Tasks do not call the parser directly. They ask the per-document store for the parse result. The store computes a result the first time it is asked, and returns the same value after that. This module is built on that one rule."
/>

<div class="prose-learn">
	<H2 id="artifact" />
	<p>
		An <dfn>artifact</dfn> is a computed result that depends only on the document (and on other artifacts). Examples are
		the parse result, the analysis result, the scoped stylesheet, and the TypeScript code generated for type checking.
		The trait only defines the output type, the name, and how to compute the value.
	</p>
</div>

<Code item={data.code.artifact} />

<div class="prose-learn">
	<p>
		<code>Parsed</code> in the Svelte plugin only parses the source. A parse failure is also a value, a
		<code>Result</code>, so a failure is also computed once and cached.
	</p>
</div>

<Code item={data.code.parsed} />

<div class="prose-learn">
	<p>
		An artifact may ask for other artifacts. The Svelte <code>ScopedStylesheet</code> asks for <code>Analyzed</code>,
		and then builds the component input with <code>component_input</code>. If the component has no <code>style</code>,
		it returns <code>None</code>.
	</p>
</div>

<Code item={data.code.scoped} mark={['context.get::<Analyzed>()', 'component_input(context)?']} />

<div class="prose-learn">
	<p>
		<code>component_input</code> itself is not an artifact. It is a function that collects borrowed values from two
		artifacts (<code>Parsed</code>, which holds the script, and <code>Normalized</code>, which holds the template) and
		groups them. The compiler's analysis and output read only this input, not the surface syntax tree. So if you can
		build an input of the same shape from another syntax, the same compiler works for it (Chapter <a
			href="/en/learn/kernel/layers#svue">05</a
		>).
	</p>
</div>

<Code item={data.code.compileInput} mark={['context.get::<Normalized>()']} />

<div class="prose-learn">
	<H2 id="registry" />
	<p>
		Artifacts are identified by their type. Registration maps each <code>TypeIdentifier</code> to a position in an array,
		and <Term name="DocumentContext" /> looks up the array by that number. If you register the same type twice, the second
		registration does nothing.
	</p>
</div>

<Code item={data.code.register} />
<Code item={data.code.slot} />

<div class="prose-learn">
	<p>
		Asking for an artifact that is not registered causes a panic. This is a wiring mistake in a plugin, not something
		that an input can cause.
	</p>

	<H2 id="get" />
	<p>
		The program creates one <Term name="DocumentContext" /> for each document. It holds one empty <code>OnceCell</code>
		for each registered artifact.
	</p>
</div>

<Code item={data.code.context} />
<Code item={data.code.get} />

<div class="prose-learn">
	<p>
		The body of <code>get</code> has three steps. It looks up the array position, computes the value only the first time
		with <code>OnceCell::get_or_init</code>, and turns the <code>Box&lt;dyn Any&gt;</code> back into the output type. That
		conversion (<code>downcast_ref</code>) never fails: the array position comes from the type, and only the result of
		that same type's <code>compute</code> goes into that position.
	</p>
	<p>
		Only when the <code>trace-artifacts</code> feature is on, <code>computed</code> records the order of the computations.
		Tests use this record to check, for example, that "this combination of tasks parsed once".
	</p>

	<H2 id="sharing" />
	<p>
		The figure below is a model that runs up to five tasks on a Svelte document. The kinds of artifacts and their
		dependencies are this language plugin's example. With <strong>Shared results</strong>, all tasks use one
		<Term name="DocumentContext" />. With <strong>Computed per task</strong>, each task creates a new
		<Term name="DocumentContext" />.
	</p>
</div>

<ArtifactCacheSim />

<div class="prose-learn">
	<p>
		In this model, when you select all tasks and the document parses, the first task parses it once and the other tasks
		read the stored result. Tasks in other languages can share artifacts of the same type in the same way. When each
		task computes its own results, the tasks do not share the store.
	</p>
	<p>
		In a measurement, we ran two kinds of compile on {data.docs.toLocaleString('en-US')} documents, and also formatted
		and linted them. The median time was <span class="tnum">{ms(data.shared.plain[0])}</span> ms with shared results and
		<span class="tnum">{ms(data.isolated.plain[0])}</span>
		ms with results computed per task. The number of allocations went down from {m(data.isolated.allocations)} million to
		{m(data.shared.allocations)} million<Note
			>The times come from a build without metrics, and the allocations come from a separate round with a metrics build.
			Chapter 13 on measurement has the details.</Note
		>.
	</p>

	<DeepDive title='Not "declare first, then plan"'>
		<p>
			The experimental design notes say: "Tasks declare which artifacts they need, and a scheduler builds the smallest
			plan." The current implementation does not work that way. Tasks declare nothing. They call <code>get</code> while
			they run, and each computation happens when it is first needed.
		</p>
		<p>
			Lazy evaluation keeps the code simple. For a document that fails to parse, nobody asks for the analysis at all. On
			the other hand, there is no way to know before a run which artifacts a combination of tasks needs. To plan ahead
			(for example, to sort out documents whose artifacts are not needed), the tasks would have to declare their needs.
		</p>
	</DeepDive>

	<H2 id="cycles" />
	<p>
		What happens if something asks for <code>ScopedStylesheet</code> while <code>ScopedStylesheet</code> is being
		computed? <code>OnceCell</code> detects the reentrant initialization and panics. A dependency cycle is a bug in a
		plugin, so stopping here is safer than silent infinite recursion.
	</p>
	<p>
		Because <Term name="DocumentContext" /> holds <code>OnceCell</code> values, it is not <code>Sync</code>. One worker handles one
		document from start to end, so no locks are needed. Work runs in parallel only across documents.
	</p>

	<Caution>
		The output type of an artifact must be <code>'static</code> (so that it fits in <code>Box&lt;dyn Any&gt;</code>). So
		the output cannot borrow the source that <Term name="DocumentContext" /> holds. It must copy the strings it needs, or
		keep positions (Span) instead.
	</Caution>

	<H2 id="attribution" />
	<p>
		Inside <code>get_or_init</code>, the processing time is measured for each kind of artifact. The time of other work
		called inside is subtracted. For example, when the Svelte compile for the browser calls the parser, the parse time is
		recorded as <code>svelte.parse</code>. That time is not included in the compile time.
	</p>
	<p>
		Without this rule, the parse cost would go to whichever task happened to ask first. Changing the task order alone
		would then change the answer to "which task is slow".
	</p>
	<p>
		The Svelte lint rule <code>svelte/valid-each-key</code> is an example. The rule only asks for artifacts: the syntax
		tree, the syntax tree arranged for compiling, and name resolution. Each of the three is a different layer (Chapter <a
			href="/en/learn/kernel/layers">05</a
		>).
	</p>
</div>

<Code item={data.code.eachKey} mark={['.get::<Parsed>()', '.get::<Normalized>()', '.get::<Resolved>()']} />

<div class="prose-learn">
	<p>
		The body of the lint task, <code>Lint::run</code>, uses <code>context.line_index()</code> when it writes the findings
		as structured data.
	</p>
</div>

<Code item={data.code.lint} mark={['context.line_index()']} />

<div class="prose-learn">
	<p>
		<code>context.line_index()</code> is not an artifact. It is a separate <code>OnceCell&lt;LineIndex&gt;</code> that
		<Term name="DocumentContext" /> holds. Converting to lines and columns is the same in every language, so the kernel holds it
		directly. Not only lint, but also the Svelte and Vue formatters receive the same index. Before, the two formatters
		built their own index again. With the shared index, the instruction count of 1 round went from 2,853,755,764 to
		2,810,876,017 (−1.5%) (42b6e550e1).
	</p>

	<H2 id="facet" />
	<p>
		The types of syntax trees and analysis results are different in each language. If a type check task for many
		languages asks for the syntax tree of one language, it cannot handle the other languages. If you write one task for
		each language, you also copy the parts that do not depend on the language: calling tsc, mapping diagnostics back,
		and writing structured data.
	</p>
	<p>
		A <dfn>facet</dfn> is the mechanism for this problem. A facet is "a question about a document", and each language
		answers it in its own way. The trait defines only the output type and the name. It has no <code>compute</code>.
	</p>
</div>

<Code item={data.code.facet} />

<div class="prose-learn">
	<p>
		A plugin registers its answer in the registry. <code>provide</code> takes a provider identifier, a predicate that
		selects the documents it handles, and a function that builds the answer from <Term name="DocumentContext" />. A
		result from a facet is stored in the same array as the other artifacts.
	</p>
</div>

<Code item={data.code.provide} />

<div class="prose-learn">
	<p>
		<code>context.facet::&lt;F&gt;()</code> finds the provider whose predicate matches the document, and computes the
		answer once with the same <code>OnceCell</code> as <code>get</code>. If no provider matches, it returns
		<code>None</code>. If more than one provider matches the same facet, it does not pick one by registration order; it
		panics. The computation time is recorded under the facet's name, not under the task that asked.
	</p>
</div>

<Code item={data.code.contextFacet} />

<div class="prose-learn">
	<p>
		The first facet is <Term name="rsvelte_typescript_check::TypeScriptView" />. Its answer is the document seen as
		TypeScript: the generated TypeScript (<code>Emitter</code>), a way to map positions back to the original document,
		and the settings and declaration files to add to the project. Svelte leaves the mapping back to the TypeScript content
		mapper. Vue passes a function that maps positions back.
	</p>
</div>

<Code item={data.code.typescriptView} />
<Code item={data.code.typescriptDocument} />

<div class="prose-learn">
	<p>
		The Svelte plugin generates TypeScript with the same type information that svelte-check checks. It does not aim for
		the same text as svelte2tsx. The Vue plugin generates code of the same shape as <code>@vue/language-core</code>. Both
		register their generated code as the answer to the facet.
	</p>
</div>

<Code item={data.code.svelteView} />
<Code item={data.code.svelteRegister} mark={['reg.provide::<TypeScriptView>("svelte"']} />
<Code item={data.code.vueRegister} mark={['reg.provide::<TypeScriptView>("vue"']} />

<div class="prose-learn">
	<p>
		The type check task, <code>rsvelte_typescript_check::Check</code>, is written against the facet only. No language
		name and no artifact name appear in it.
	</p>
</div>

<Code item={data.code.prepare} mark={['context.facet::<TypeScriptView>()?']} />

<div class="prose-learn">
	<p>
		The same type check can be registered as three tasks. One checks only Svelte, and one checks only Vue. The command
		line program also registers one that checks TypeScript, Svelte, and Vue together. With it, the TypeScript compiler
		can check a project that mixes Svelte and Vue in one run. When this was introduced, the compiler calls for 30 test
		cases went down from 2 to 1. The run time went from about 100 ms to 67 ms (a15cdcda04).
	</p>
	<p>
		The per-language artifact <code>TypeScriptProjection</code> was removed at that time. A facet does not replace
		artifacts. It adds an interface for each language on top of artifacts. The Svelte <code>typescript_view</code>, which
		builds the Svelte answer, is ordinary code that asks for the Svelte <code>Parsed</code>.
	</p>
</div>

<ChapterFooter chapter={c} />
