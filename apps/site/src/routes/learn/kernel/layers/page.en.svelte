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
	import LayerView from '$lib/widgets/LayerView.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const c = chapter('layers', 'en');

	const stack = [
		{ name: 'svelte.parse', layer: 'Surface', what: 'The tree as written. The formatter reads only this.', readers: 'all' },
		{ name: 'svelte.compiler_syntax_tree', layer: 'HIR (high-level intermediate representation)', what: 'The template in the form that the compiler understands.', readers: 'compile, lint' },
		{ name: 'svelte.resolve', layer: 'Name resolution', what: 'Scopes, the map from names to bindings, and rune kinds. Reads the syntax tree arranged for compiling.', readers: 'compile, lint' },
		{ name: 'svelte.analyze', layer: 'Compiler facts', what: 'Expression dependencies, dynamic fragments, and the elements that each style rule selects. Reads the syntax tree arranged for compiling and the name resolution.', readers: 'compile' },
		{ name: 'svelte.css', layer: 'Output', what: 'The style sheet with scoping added.', readers: 'compile' },
		{ name: 'ts.view', layer: 'Output (the shared interface)', what: 'The TypeScript that the type checker reads. The Svelte answer is built from the original syntax tree.', readers: 'check' }
	];
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="A parsed tree has the shape of the source as it was written. Lint rules and the type checker want to know what it means. This chapter puts a syntax tree arranged for compiling on top of the syntax tree, puts name resolution on top of that, and shows how rules and tools read only the layers they need."
/>

<div class="prose-learn">
	<H2 id="why" />
	<p>
		A check that looks only at syntax needs different information from a check that also looks at what values mean.
		For example, the Svelte rule <code>svelte/button-has-type</code> checks that a <code>{'<button>'}</code> has a <code>type</code>.
		If you write this rule on the syntax tree, the attribute value comes out as a list of text parts and expression parts. Is it a static string? What is its value after character references are expanded? Is it the shorthand <code
			>{'{type}'}</code
		>? The compiler already has code that answers these questions. If each rule writes this code again, the same decision ends up in several slightly different copies.
	</p>
	<p>
		The Rust compiler, rustc, builds layers on the syntax tree: a tree arranged for compiling, then types, then an intermediate representation that is easier to process. Each layer reads the layer before it and adds facts. Lint
		rules and analysis tools read the layer that answers their question. rsvelte uses the same shape. To the kernel, a layer is only another computed result, so the design needs just two new things: a number for each item in a layer, and a table that you look up by that number.
	</p>

	<H2 id="ids" />
	<p>
		A layer numbers its items from 0. When a later layer learns a fact about an item, it does not write the fact into the tree. It puts the fact in a table that is looked up by the item's number (a table of analysis results). A tree never changes after it is built.
	</p>
	<p>
		The numbers have types. Every number type implements the trait for <Term name="TypedIndex" />, and <code>newtype_index!</code> creates such a type. The value inside is not a
		<code>u32</code> but a <code>NonZeroU32</code> that holds the number plus 1 (the next section explains why).
	</p>
</div>

<Code item={data.code.index} />
<Code item={data.code.newtype} />

<div class="prose-learn">
	<p>
		<code>IndexVector&lt;I, T&gt;</code> is a <code>Vec</code> that you can index only with <code>I</code>. If you try to look up the binding table with a scope number, the code does not compile. It never returns a wrong value at run time.
	</p>
</div>

<Code item={data.code.indexVec} />
<Code item={data.code.fromElem} />

<div class="prose-learn">
	<p>
		Scope analysis in <code>rsvelte_typescript</code> was the first user of these types. <code>BindingIdentifier</code> and <code>ScopeIdentifier</code>
		became typed numbers, and the parent of the root scope became <code>None</code> instead of the sentinel <code>u32::MAX</code>. One exception is the table that gives the binding of each node. It still stores a raw
		<code>u32</code> with the sentinel <code>u32::MAX</code>, and it shows outside code only <code>binding_of</code>. We chose this form when
		<code>Option&lt;BindingIdentifier&gt;</code> took 8 bytes. After the change in the next section, <code>Option&lt;BindingIdentifier&gt;</code> also takes 4 bytes.
	</p>

	<DeepDive title="Links between layers are tables too">
		<p>
			When you go one layer down, you need a link that says which item of the layer above each item came from. This link is also a table. The syntax tree arranged for compiling has the table <code
				>origin: IndexVector&lt;CompilerNodeIdentifier, TemplateNodeIdentifier&gt;</code
			>.
			This example comes from the Svelte tree for compiling. The table records which element of the original syntax tree each element was built from. The <code>← n</code> in Figure 5.1 shows this link.
		</p>
	</DeepDive>

	<H2 id="niche" />
	<p>
		When the value inside a number type is a <code>NonZeroU32</code>, Rust knows that the value 0 is never used. So it can store the <code>None</code> of <code>Option&lt;Identifier&gt;</code>
		as 0 (the niche optimization). <code>Option&lt;Identifier&gt;</code> takes the same 4 bytes as <code>Identifier</code>. You can say whether a parent or a target exists without reserving a special number. The number types of rustc
		and oxc have the same form.
	</p>
	<p>
		The cost is that every new number adds 1, and every table lookup subtracts 1. The commit that added this measured the cost as +0.08% in instructions for 1 round. The gain was a 3.3% drop in the bytes that <code
			>svelte.resolve</code
		>
		allocates (36c3539efb). <code>newtype_index!</code> also accepts named numbers, such as <code>const ROOT = 0;</code>.
	</p>
	<p>
		The same commit fixed the size of frequently used records at compile time. A <code>const _: () = assert!(size_of::&lt;T&gt;() == N)</code>
		sits next to each of these types. If someone adds a field and the type grows, the build stops before the comparison with the performance baselines would notice. A change in size becomes a decision, not an accident.
	</p>
</div>

<figure class="my-8 overflow-x-auto">
	<table class="table">
		<thead><tr><th>Type</th><th class="num">Bytes</th><th>File</th></tr></thead>
		<tbody>
			{#each data.layouts as l (l.file + l.type)}
				<tr>
					<td><code>{l.type}</code></td>
					<td class="num">{l.bytes}</td>
					<td class="font-mono text-[13px] text-fg-2">{l.file}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		Every <code>assert!(size_of::&lt;T&gt;() == N)</code> in the crates that this guide quotes. The build reads them from the source each time.
	</figcaption>
</figure>

<div class="prose-learn">
	<p>
		We also measured a plan to make the <code>Node</code> of the formatter's data structure 16 bytes (drop the <code>Static</code> variant that holds a <code>&'static str</code>, and copy literals into the text buffer too). Both the instruction count and the allocated bytes went up, so we did not adopt it (36c3539efb).
	</p>

	<H2 id="tokens" />
	<p>
		The lowest layer must not lose anything that was written. Each language decides whether its tree drops whitespace and comments or keeps them, and the kernel does not decide this. The kernel asks for one thing only: when you put the tokens of a parse result in order, including whitespace and comments, they match the source byte for byte. You can check this property without knowing the language.
	</p>
</div>

<Code item={data.code.lossless} />

<div class="prose-learn">
	<p>
		The token table is built and dropped for each document, so its buffers are also borrowed from the thread's pool and given back (Chapter <a href="/en/learn/kernel/buffer-pool#users">12</a>).
	</p>
</div>

<Code item={data.code.tokensDefault} />

<div class="prose-learn">
	<p>
		Some questions are about things that are written but carry no meaning, such as "Is this expression in parentheses?" or "Which comment comes before this statement?" The token table answers them without reading source bytes. <code>before</code> is the counterpart of <code>getTokenBefore</code> in
		typescript-eslint.
	</p>
</div>

<Code item={data.code.before} />

<div class="prose-learn">
	<p>
		Svelte tokens are the markup tokens, the tokens and comments that the JavaScript parser consumed, and the whitespace between them. A style sheet is one <code>Stylesheet</code> token until the style sheet
		parser records its own tokens.
	</p>
</div>

<Code item={data.code.tk} />

<div class="prose-learn">
	<p>
		With the token table, we also recorded two facts in the original syntax tree. Tools used to guess them by reading the source: whether an attribute was written as the shorthand <code>{'{a}'}</code>,
		and whether a tag was closed with <code>/&gt;</code>. The reads of <code>source_text.as_bytes()[…]</code> in three places are gone: the syntax tree arranged for compiling, the code generated for the type checker, and the formatter.
	</p>
	<p>
		A test checks that the token table matches the source for the 5,410 files of the test corpus that the parser accepts (882,917 tokens, 4,259,323
		bytes). We built one version that does not record attribute text and one that records JavaScript comments as whitespace. The test fails on
		3,602 files and 303 files. No output changed anywhere in the test corpus. Recording the tokens raised the median time to process the whole test corpus with 1 thread from
		451 milliseconds to 459 milliseconds (about 1.7%). At first the cost was 3.5%, and most of it came from the JavaScript token table growing from empty for each document.
	</p>

	<H2 id="stack" />
	<p>Language plugins decide the types of the layers and how to split them. The kernel stores registered computed results when something asks for them. The table and the figure below are examples from the Svelte plugin.</p>
</div>

<figure class="my-8 overflow-x-auto">
	<table class="table">
		<thead><tr><th>Computed result</th><th>Layer</th><th>Contents</th><th>Tasks that read it</th></tr></thead>
		<tbody>
			{#each stack as s (s.name)}
				<tr>
					<td class="whitespace-nowrap"><code>{s.name}</code></td>
					<td class="whitespace-nowrap">{s.layer}</td>
					<td class="text-[14.5px] text-fg-2">{s.what}</td>
					<td class="font-mono text-[13px] whitespace-nowrap text-fg-2">{s.readers}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</figure>

<LayerView />

<div class="prose-learn">
	<H2 id="resolve" />
	<p>
		Name resolution links each reference to an identifier with its declaration. The rules of the language decide where a variable can be referenced.
		In the Svelte example, it links the identifiers of the script and the template to bindings.
		It also records functions that set how state is handled, such as <code>$state</code>, as rune kinds.
	</p>
</div>

<Code item={data.code.resolution} />
<Code item={data.code.bindKind} />

<div class="prose-learn">
	<p>
		Before, this information was part of the compiler's analysis result (<code>Analysis</code>). So lint rules that only wanted scopes computed the whole compiler analysis, including the matching of style sheet
		selectors. Now they ask only for <code>Resolved</code>. <code>Analysis</code>
		became a layer on top of name resolution that adds the facts only the compiler needs.
	</p>
</div>

<Code item={data.code.resolve} />

<div class="prose-learn">
	<H2 id="compiler_syntax_tree" />
	<p>
		The tree for compiling is the original syntax tree converted into a form that suits the work of producing output.
		Below is the example that converts Svelte templates. The types and conversion rules of this tree are not a shared kernel specification. The builder reads the original syntax tree. It reads source text only for names and for text whose character references it expands. The compiler analysis (<code
			>svelte.analyze</code
		>) and the client and server output read the syntax tree arranged for compiling, not the original syntax tree.
	</p>
	<ul>
		<li><code>{'{#if}…{:else if}…{:else}'}</code> becomes one element with a list of branches, not nested <code>If</code> elements.</li>
		<li>Each element has a kind: a regular element, a component, a <code>{'<title>'}</code> inside <code>{'<svelte:head>'}</code>, a <code
				>{'<slot>'}</code
			>, or a <code>svelte:</code> meta tag.</li>
		<li>A plain attribute value is a boolean attribute, a static string (with character references expanded), a single expression, a shorthand, or an interpolation. Directives such as <code>bind:</code> and the spread syntax each have their own kind.</li>
		<li>Text has its character references expanded.</li>
		<li>Every element has a <code>CompilerNodeIdentifier</code>, a parent, and its origin in the surface layer.</li>
	</ul>
</div>

<Code item={data.code.compiler_syntax_tree} />
<Code item={data.code.attributeValue} />

<div class="prose-learn">
	<p>
		The element kind is decided in the same order as in the Svelte parser (<code>phases/1-parse/state/element.js</code>): <code>meta_tags</code>, <code
			>regex_valid_component_name</code
		>, <code>{'<title>'}</code> inside <code>{'<svelte:head>'}</code>, and then <code>{'<slot>'}</code>. When the builder walks up the parents, it skips every element that is not a block, a regular element, or a component. This also matches the upstream
		<code>parent_is_head</code>.
	</p>
</div>

<Code item={data.code.elementKind} />

<div class="prose-learn">
	<p>
		<code>element_kind</code> is a method of <code>CompilerSyntaxTreeBuilder</code>. <code>CompilerSyntaxTreeBuilder</code> is a public type, and it knows nothing about the original Svelte
		syntax tree. It only adds elements, records lists of children, and walks up the ancestors to decide element kinds. The type that builds the syntax tree arranged for compiling from the original Svelte syntax tree is
		<code>SurfaceBuilder</code>, which is written on top of it.
	</p>
</div>

<Code item={data.code.compilerSyntaxTreeBuilder} />

<div class="prose-learn">
	<p>
		The regular expression for component names uses <code>\p{'{'}Lu}</code>, <code>\p{'{'}ID_Start}</code>, and <code>\p{'{'}ID_Continue}</code>.
		ID_Start and ID_Continue are checked with the tables of <code>unicode-id-start</code>. <code>\p{'{'}Lu}</code> is
		Rust's <code>char::is_uppercase</code> without Other_Uppercase (<code>Ⅰ</code> and <code>Ⓐ</code>), because <code
			>is_uppercase</code
		>
		counts those as uppercase too<Note>
			We do not match differences between Unicode versions. If V8 and the Rust standard library have tables from different versions, a newly added character can give a different result.</Note
		>.
	</p>
	<p>
		A list of children is added in one step, after all the children are built. Building each child pushes the numbers of its own children first, so if the list were added earlier, the siblings would not be next to each other.
	</p>
</div>

<Code item={data.code.list} />

<div class="prose-learn">
	<H2 id="svue" />
	<p>
		The compiler reads only the syntax tree arranged for compiling. So if another language can build this tree, the same compiler can output JavaScript for the Svelte
		runtime. <code>rsvelte_svue</code> uses this to compile <code>.vue</code> components for the Svelte runtime
		<strong>with their Vue meaning</strong>. It adds no new language. It adds only two tasks for <code>.vue</code> documents:
		<code>svue.compile/client</code> and <code>svue.compile/server</code>. The translation reads the parse and name resolution results of the Vue plugin. For the translated result, it uses the name resolution, analysis, and output of the Svelte plugin. All that <code>rsvelte_svue</code> owns is the translation that builds, from the Vue syntax tree, a script that uses Svelte runes and a
		syntax tree arranged for compiling.
	</p>
</div>

<Code item={data.code.svueRegister} />
<Code item={data.code.svueTranslated} />
<Code item={data.code.svueInput} />

<div class="prose-learn">
	<p>
		The same syntax means different things in the two runtimes. Vue's <code>{'{{ e }}'}</code> goes through <code>toDisplayString</code>,
		so an object becomes a string in the same form as <code>JSON.stringify</code> gives. Svelte's <code>{'{e}'}</code> is <code>String(e)</code>. In Vue,
		a <code>Boolean</code> prop that is not passed becomes <code>false</code>, and attributes that are not declared pass through to the root element.
	</p>
	<p>
		The translation does not approximate these differences. It calls Vue's own code to reproduce them.
	</p>
	<ul>
		<li>Interpolation: calls <code>toDisplayString</code> from <code>vue</code>.</li>
		<li><code>v-for</code>: calls <code>renderList</code>.</li>
		<li><code>Boolean</code> props: become a <code>$derived.by</code> that copies <code>resolvePropValue</code> from runtime-core.</li>
		<li><code>v-model</code> for the server: becomes the same attributes that compiler-ssr outputs.</li>
	</ul>
	<p>
		svue has no upstream compiler, so the reference is behavior, not output text. For a component built with the official Vue, we record the element tree on screen and the server rendering result after each step of a sequence of user actions. We compare that record with a record of rsvelte's
		output running on the Svelte runtime.
	</p>
	<p>
		We did not change the Svelte port for svue. This keeps the rule that every Svelte port matches the output of the upstream <code>svelte/compiler</code>.
		The only addition to the Svelte plugin is
		<code>compiler_syntax_tree::spelled_text</code>, which puts a string from another language into the syntax tree as text. The <code>svelte.compile</code> output was the same byte for byte before and after this addition (ed7af962b2).
	</p>
	<p>
		The translation outputs only syntax that the Svelte port compiles in the same way as upstream. Vue text has already collapsed its whitespace, so the Svelte
		compiler runs with the upstream <code>preserveWhitespace</code> option and does not collapse whitespace a second time. Attributes that pass through to the root become
		<code>{'{...attrs}'}</code>, and <code>class</code> is merged with the same rules as <code>mergeProps</code> in runtime-core. Vue writes the attribute only when props has a
		<code>class</code> key. So on an element that has no <code>class</code> of its own, the merge happens inside the spread syntax. The behavior comparison cannot see invisible whitespace or an empty
		<code>class</code> attribute, so crate tests pin these two cases.
	</p>
</div>

<Code item={data.code.svueClass} />

<div class="prose-learn">
	<p>
		In the commit that added it, of the 12 hand-written test cases, 4 matched for the client and 7 matched for the server. The rest were rejected, and 0 did not match (73c8eea9c1). Every rejected case had a translation, but the Svelte
		port could not compile its syntax yet: <code>v-model</code> for the client (which runs Vue's <code>vModelText</code> and similar code through <code>{'{@attach}'}</code>),
		attributes that pass through to the root (<code>{'{...attrs}'}</code>), and <code>&lt;select&gt;</code>.
		Since the Svelte port added support for these, all 12 test cases match for both the client and the server.
	</p>
	<p>
		On the Vue port side, we added <code>v-on</code> modifiers. Like compiler-dom, <code>vue.compile</code> outputs them with <code>withModifiers</code> and <code
			>withKeys</code
		>.
	</p>
	<p>
		Before this work, the analysis and output of the Svelte plugin were moved to read the syntax tree arranged for compiling instead of the original syntax tree. Code outside the plugin can build this tree. An attribute name can be a string, not only a position in the source. For example,
		Vue's <code>@click</code> becomes the name <code>onclick</code>, but that name is not written in the source. At that move, the hashes of the compile, format, and lint output for 70,608 files in the Svelte test corpus
		were the same before and after (db94f0bd13).
	</p>

	<H2 id="vuelte" />
	<p>
		<code>rsvelte_svelte_compile_vapor</code> compiles Svelte components to Vue Vapor.
		It shares parsing, name resolution, normalization, and analysis with <code>svelte.compile</code>.
		The translation builds new trees. A Rust backend emits element factories and render effects from those trees.
		The task identifiers remain <code>vuelte.compile/client</code> and <code>vuelte.compile/server</code>.
		The server target keeps the Vue server rendering backend. Hydration is not supported.
	</p>
</div>

<Code item={data.code.vuelteRegister} />
<Code item={data.code.vuelteModule} />

<div class="prose-learn">
	<p>
		vuelte has no upstream compiler either, so the reference is behavior. We show a component built with the official Svelte on screen and record the element tree and the server rendering result after each step of a sequence of user actions. We compare that record with a record of rsvelte's
		output running on the Vue runtime.
	</p>
	<p>
		Svelte bindings to elements run inside the Vapor <code>renderEffect</code>. An effect tracks the values that it reads and updates the element when they change.
		When a branch, one item of a loop, or a component is removed, <code>onScopeDispose</code> cleans up its element bindings.
	</p>
</div>

<Code item={data.code.vuelteRef} />
<Code item={data.code.vuelteBindText} />

<div class="prose-learn">
	<p>The behavior comparison found these differences (<code>docs/fixtures.md</code> §12.8). Each one is reproduced as follows.</p>
	<ul>
		<li>
			Interpolation: Vue's <code>toDisplayString</code> turns an object into a string in the same form as <code>JSON.stringify</code> gives. The translation first applies the same conversion as Svelte
			and then passes the result on. The client uses <code>{'`${e ?? \'\'}`'}</code>, and the server uses <code>{"String(e ?? '')"}</code>.
		</li>
		<li>
			Whitespace between elements: the text that the Svelte <code>clean_nodes</code> keeps goes into the Vue syntax tree as it is. Vue collapses whitespace only while it builds its syntax tree, not after.
		</li>
		<li>Props that are not passed: <code>defineProps</code> has no <code>type</code>, so Vue does not convert the value to <code>Boolean</code>.</li>
		<li>
			Attributes that are not declared: every component gets <code>defineOptions({'{ inheritAttrs: false }'})</code>. <code
				>{'let { ...rest } = $props()'}</code
			> becomes <code>useAttrs()</code>. On an element with spread syntax, all attributes are collected into one object. That object goes to helper functions ported from the Svelte functions
			<code>set_attributes</code> (client) and <code>attributes</code> (server).
		</li>
		<li><code>bind:value</code> on number and range inputs: reads and writes a number, not a string.</li>
	</ul>
	<p>
		Syntax that cannot be reproduced is rejected before any output is built. It is not converted into something that only looks close. For example, an
		<code>await</code> inside the expression of an attachment, an action, a transition, or an animation is rejected. <code>crates/languages/svelte/compile_vapor/COVERAGE.md</code> lists what is supported.
	</p>
	<p>
		In the commit that added it (24c6e6a123), 11 of the 12 hand-written test cases matched for both the client and the server. The remaining case was a spread attribute, which was rejected. After spread support was added (6b5621c994), all 12
		test cases match. On the Svelte test corpus, it produced 685 client outputs and 686 server outputs, with 0 crashes. When run next to the official
		Svelte, every output matched the record taken at first display. This includes outputs where both throw the same exception.
	</p>
	<p>
		On the Vue port side, we added four things: <code>defineOptions</code>, <code>&lt;pre&gt;</code>, function <code>:ref</code>, and object <code
			>v-bind</code
		>. The compile output of the Vue test cases did not change.
	</p>

	<H2 id="lint" />
	<p>
		A rule asks the document context for the layer that answers its question. Each rule reads different layers.
	</p>
	<ul>
		<li>
			<code>no-unused-vars</code> reads the original syntax tree and name resolution. It is a port of an ESLint rule that looks at the kind of the parent node and at how a declaration is written, so it needs the tree as written.
		</li>
		<li>
			<code>svelte/button-has-type</code> reads only the original syntax tree. If every part of the attribute value is a string, the rule checks it as a static value. It does not check values that contain an expression.
		</li>
		<li>
			<code>svelte/valid-each-key</code> reads the <code>{'{#each}'}</code> of the syntax tree arranged for compiling, and name resolution.
		</li>
	</ul>
	<p>
		In the Svelte plugin, each rule in the configuration (<code>RuleConfiguration</code>) implements <code>Rule</code> and asks for the layers it needs when it runs. <code>Findings</code> in
		<code>rsvelte_lint</code> runs the rules in configuration order and collects their findings in one list. Findings at the same position are in rule order.
	</p>
</div>

<Code item={data.code.findings} />
<Code item={data.code.lint} />
<Code item={data.code.ruleImpl} mark={['.get::<Parsed>()', 'no_unused_variables::check(context, self.identifier(), out)', 'valid_each_key::check(context, out)']} />
<Code item={data.code.button} mark={['static_problem(component, source, attribute, allowed)', 'AttributeValue::True', 'None if !shorthand && !spread']} />
<Code item={data.code.staticProblem} mark={['let Part::Text(span) = part else', 'check_static(&value, allowed)']} />

<div class="prose-learn">

	<H2 id="shared-lint" />
	<p>
		The official Svelte and Vue plugins each have their own rule that checks the type of a button:
		<code>svelte/button-has-type</code> and <code>vue/html-button-has-type</code>. In rsvelte,
		the decision is one function in <code>rsvelte_markup::button_type</code>: the values that <code>type</code> can take, the four messages, and the options.
	</p>
</div>

<Code item={data.code.buttonType} />

<div class="prose-learn">
	<p>
		Each plugin keeps only the part that comes from the differences between the two trees.
	</p>
	<ul>
		<li>
			Svelte takes the first <code>type</code> of any value kind, accepts the shorthand <code>{'{type}'}</code>, and reports on the whole attribute.
		</li>
		<li>
			Vue looks for a static <code>type</code> first and then for <code>:type</code>, compares attribute names without regard to case, and reports on the value node (including the quotes).
		</li>
	</ul>
</div>

<Code item={data.code.vueButton} mark={['check_static(&text, Allowed::default())', 'value_node(v, a.quoted)']} />

<div class="prose-learn">
	<p>
		The Vue rule and the Svelte rule are both written on the original syntax tree of their own language. The trees have different shapes, but that does not stop them from sharing the decision. What they share is a decision about values, not a tree.
	</p>
	<p>
		<code>vue/html-button-has-type</code> was a new rule at that time, and <code>vue.lint</code> matched the official reference tool on 19 of 19 test cases. As a control, we confirmed that shifting the reported range by the width of the quotes
		drops the result to 18/19. <code>svelte.lint</code> stayed at 12/12 (5c933023a7).
	</p>

	<H2 id="next" />
	<Caution>Everything from here on is a plan. Only the item about types has prototype code.</Caution>
	<ul>
		<li>
			Types: a prototype of lint rules that use types exists (<code>rsvelte_svelte_lint_typed</code>). Today it infers types from syntax and name resolution (<code>TypeFacts::infer</code>) and receives them through the shared interface. Getting types from tsgo and putting them in tables looked up by <code>CompilerNodeIdentifier</code>
			and by the <code>NodeIdentifier</code> of an expression is still a plan. The layer that holds types is a computed result separate from the syntax tree arranged for compiling.
		</li>
		<li>
			Control flow and data flow: planned as a structure separate from the syntax tree arranged for compiling. It holds a table of basic blocks and edges, and a dependency graph of <code>$state</code> and
			<code>$derived</code>. Its items point to the numbers of the syntax tree arranged for compiling.
		</li>
		<li>
			Output: client and server JavaScript are already built from the syntax tree arranged for compiling. The TypeScript code generated for type checking (the Svelte answer of <code>ts.view</code>)
			is still built from the original syntax tree. Moving it to the syntax tree arranged for compiling and the data flow layer would let the compiler, lint rules, and the type checker share the same decisions.
		</li>
		<li>
			Your own tools: a new tool writes one task and asks for the layers it needs with <code>context.get</code>. If it reads the same layer as an existing task, that layer is not computed again.
		</li>
	</ul>
</div>

<ChapterFooter chapter={c} />
