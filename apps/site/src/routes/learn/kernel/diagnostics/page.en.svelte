<script lang="ts">
	import Term from '$lib/components/Term.svelte';
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import DeepDive from '$lib/components/DeepDive.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import LintSort from '$lib/widgets/LintSort.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const c = chapter('diagnostics', 'en');
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="Compile errors, lint findings, and type errors all use the same Diagnostic. This chapter covers the shape of a diagnostic, the rule “print no output for what is not ported,” and the conditions that a lint rule must meet."
/>

<div class="prose-learn">
	<H2 id="diagnostic" />
	<p>
		A <dfn>Diagnostic</dfn> holds only a severity, a code for machines to read, a message for people to read, a position, and a flag that says whether it has an end. The position is a
		<code>Span</code> in bytes. It is converted to a line and a column only once, when a task writes its output.
	</p>
</div>

<Code item={data.code.severity} />
<Code item={data.code.diagnostic} />

<div class="prose-learn">
	<p>
		<code>code</code> is a <code>Cow&lt;'static, str&gt;</code>. Most codes are static strings such as <code>"no-unused-vars"</code>,
		so creating a diagnostic does not allocate a string.
	</p>
	<p>
		<code>has_end</code> was added together with Vue support. Some ESLint rules report only one position (the <code>source_location</code> of <code
			>vue/multi-word-component-names</code
		>
		is only the start point). Such findings are created with <code>without_end</code>, and the output writes their end as <code>null</code>.
		In upstream output, a finding with a range of length 0 and a finding with no end are different things (573ac584b6).
	</p>

	<H2 id="unsupported" />
	<p>
		The rsvelte port is not finished, and it does not support much syntax yet. What happens if it produces plausible output when it meets such syntax? Output that matches “by chance” gets into the match rate against upstream. Then nobody can tell which output really came from ported code.
	</p>
	<p>So the kernel has a type only for “not supported.”</p>
</div>

<Code item={data.code.unsupported} />
<Code item={data.code.unsupportedImpl} />

<div class="prose-learn">
	<p>
		<code>Unsupported</code> holds what is not supported (<code>what</code>) and where it is (<code>source_location</code>). Its position type is an
		<Term name="SourceLocation" />. So a refusal that no single construct causes (for example, when the layout of the whole document does not fit on one line) says “no position” explicitly with
		<code>nowhere</code> (Chapter <a href="/en/learn/kernel/source#loc">02</a>). In the next example, the Svelte format task gets an <code>Unsupported</code>,
		writes no file, and keeps only a diagnostic that points at that construct.
	</p>
</div>

<Code item={data.code.format} mark={['Err(u) => out.diagnostics.push', 'u.span(),']} />

<div class="prose-learn">
	<p>
		Most of the documents “with diagnostics” in the benchmark are these refusals. Of {data.documents.toLocaleString('en-US')} documents, the formatter reported a diagnostic such as “not supported” for {data.format.diagnostics.toLocaleString('en-US')} documents<Note
			>The numbers come from the run time benchmark of Chapter 13 (build {data.benchRev.slice(0, 10)}). “No diagnostics” does not mean correct output. Correctness is measured separately against upstream output (Chapter <a
				href="/en/learn/measure#parity">13</a
			>, “Checks against correctness baselines”).</Note
		>.
	</p>

	<DeepDive title="Why a refusal has a position">
		<p>
			Without a position, only the message string tells which construct caused the refusal, and an editor cannot point at the place. With a position, you can count over the test corpus which construct was refused, where, and how many times. Both help decide what to port next.
		</p>
	</DeepDive>

	<H2 id="rule" />
	<p>
		The conditions that a lint rule must meet are in <code>rsvelte_lint</code>, which all languages share. The kernel runs tasks and receives their outputs and diagnostics. A rule is generic over a context type <code>C</code>,
		and the language decides <code>C</code>.
	</p>
</div>

<Code item={data.code.rule} />

<div class="prose-learn">
	<p>
		The context of the Svelte plugin is one <code>DocumentContext</code>, which holds the computed results of the document. Each rule in the configuration (<code>RuleConfiguration</code>)
		implements <code>Rule&lt;DocumentContext&gt;</code>. When it runs, each rule asks for the layer that answers its question: the original syntax tree, name resolution, or the syntax tree arranged for compilation. Rules run in configuration order (for layers, see Chapter
		<a href="/en/learn/kernel/layers#lint">05</a>).
	</p>
</div>

<Code item={data.code.rules} />
<Code item={data.code.ruleImpl} />
<Code item={data.code.noUnused} mark={['rsvelte_typescript_lint::no_unused_variables(&facts, identifier, |_| true, out)']} />

<div class="prose-learn">
	<p>
		The body of <code>no-unused-vars</code> is in <code>rsvelte_typescript_lint</code>. It is a rule about the meaning of JavaScript, so the Vue
		plugin uses it as it is. The only difference is that the host passes which bindings to check. In Vue, the core rule does not check the variables of <code>v-for</code>;
		<code>vue/no-unused-vars</code> checks them. If you swap the two, <code>lint-cases</code> fails in the comparison with the official tools (73e09d6167). Chapter
		<a href="/en/learn/kernel/layers#shared-lint">05</a> has another example of two plugins that share one decision.
	</p>

	<H2 id="order" />
	<p>
		<code>Findings</code> runs the rule set of each layer in order, opens a measurement phase for each rule, and finally sorts the findings by start position. With only one layer,
		<code>rsvelte_lint::rules::run</code> does the same.
	</p>
</div>

<Code item={data.code.run} mark={['measurement::phase(rule.identifier())', 'assert!(', 'sort_by_key']} />

<div class="prose-learn">
	<p>
		<code>sort_by_key</code> is a stable sort, so findings at the same position stay in the order that the rules reported them. ESLint also sorts stably by line and then by column, so the order is the same as upstream.
	</p>
</div>

<LintSort />
<Code item={data.code.orderTest} />

<div class="prose-learn">
	<p>
		<code>assert!</code> checks that a rule reports only under its own identifier (a string). The check also runs in release
		builds, so a rule that breaks the condition panics at once, and <code>run_document</code> reports it as a panic of that document (Chapter <a
			href="/en/learn/kernel/pipeline#run-document">06</a
		>). The cost is one comparison for each finding that the rule reported.
	</p>

	<H2 id="render" />
	<p>
		<code>render_json_with_rules</code> writes the findings as JSON (JavaScript Object Notation) in the same shape as ESLint (<code>render_json</code> also calls it). Lines start at 1, columns also start at 1, and the unit is the UTF-16 code unit (the encoding that JavaScript strings use). <code
			>LineColumn::column</code
		>
		counts from 0, so this function adds 1. For a finding with no end, <code>end</code> is written as <code>null</code>.
	</p>
</div>

<Code item={data.code.render} mark={['lc.column + 1', 'if key == "end" && !d.has_end {']} />
<Code item={data.code.columnsTest} />

<ChapterFooter chapter={c} />
