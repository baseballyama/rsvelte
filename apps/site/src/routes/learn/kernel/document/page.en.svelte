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
	import DocumentPrinter from '$lib/widgets/DocumentPrinter.svelte';
	import type { PageData } from './$types';
	import { call, fill, flatOnly, groupIds, mustBeFlat, remeasure } from './presets';

	let { data }: { data: PageData } = $props();
	const c = chapter('doc', 'en');
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="The formatter does not turn code into a string directly. It builds a tree of instructions such as “put this on 1 line if it fits; if not, break the line and indent”. The printer then turns the tree into a string that fits the width. The kernel's printer is a port of the Prettier printer, so the same tree gives the same string."
/>

<div class="prose-learn">
	<H2 id="ir" />
	<p>
		The formatter's intermediate representation is a tree called <dfn>LayoutInstruction</dfn>. Its leaves are text and line break
		candidates (line). Its inner nodes include group, which collects other nodes, and indent, which adds indentation. The printer is
		a port of the Prettier implementation (<code>printDocToString</code>), not of the paper behind it, and the comment at the top of
		the file says so.
	</p>
	<blockquote class="font-mono text-[14px] leading-[1.7] whitespace-pre-line text-fg-2" lang="en">{data.docs}</blockquote>
	<p>There are four kinds of line break candidates.</p>
</div>

<Code item={data.code.lineKind} />

<div class="prose-learn">
	<p>
		A node is a <code>Copy</code> enum. <code>Concat</code>, <code>Group</code>, and <code>Fill</code> list children, so they hold a
		range (<code>start</code>, <code>len</code>) of a child list. All child lists are stored in one vector,
		<code>LayoutInstructions::children</code>. <code>Indent</code>, <code>Dedent</code>, <code>FlatOnly</code>, <code>IfBreak</code>, and
		<code>IndentIfBreak</code> have a fixed number of children, so they hold the identifiers of their children directly.
	</p>
</div>

<Code item={data.code.node} />
<Code item={data.code.docs} />

<div class="prose-learn">
	<p>
		No node gets its own <code>Box</code>. Building a document allocates memory only when the four vectors (<code>nodes</code>,
		<code>breaks</code>, <code>children</code>, and <code>buffer</code>) grow. Text that is made at run time is appended to
		<code>buffer</code> too, and the node holds only its range.
	</p>
</div>

<Code item={data.code.text} />

<div class="prose-learn">
	<p>
		Text made of several pieces, such as the closing tag <code>&lt;/div&gt;</code>, is built with <code>text_parts</code>. If you
		first make a <code>String</code> with <code>format!</code> and then pass it to <code>text</code>, that <code>String</code> is one more
		allocation. <code>text_parts</code> writes the pieces directly to <code>buffer</code>. After this change, the number of memory
		allocations in 1 run went down from 2,192,937 to 2,021,660. For Svelte formatting alone, it went down from 691,547 to 520,270
		(e0ef873545).
	</p>
</div>

<Code item={data.code.textParts} />

<div class="prose-learn">
	<p>
		The four vectors themselves are not made again for each document. <Term name="LayoutInstructions" /> borrows buffers from the
		thread's pool, keyed by its own type (<Term name="LayoutInstructions" />), and returns them in reverse order in <code>Drop</code>
		(Chapter <a href="/en/learn/kernel/buffer-pool#keyed">12</a>).
	</p>
</div>

<Code item={data.code.pooled} />

<div class="prose-learn">
	<H2 id="printer" />
	<p>
		The printer is a loop over a stack of commands. A command is a triple (indentation, mode, element). The mode is either
		<dfn>flat</dfn> (on 1 line, with no line breaks) or <dfn>break</dfn> (with line breaks).
	</p>
	<p>
		In break mode, the printer uses <code>fits</code> to check whether a group of content fits on one line. If it fits, the printer
		does not break it. If it does not fit, the printer pushes instructions that break it. In flat mode, the printer prints the inner
		groups without line breaks too.
	</p>
</div>

<DocumentPrinter label="Figure 8.1 · Document printer" presets={[call, fill, groupIds, flatOnly, remeasure]} />

<Code item={data.code.run} mark={['self.choose_group(identifier, indentation, mode, stack)', 'self.remeasure = true']} />
<Code item={data.code.chooseGroup} mark={['let breaks_line = self.docs.will_break(identifier);', 'else if self.fits(&flat, stack, self.remaining(), false)']} />

<div class="prose-learn">
	<p>
		In flat mode, a line becomes a space (a softline becomes nothing). In break mode, it becomes a newline and indentation. A hardline
		always breaks, even inside a flat group. When that happens, the printer sets <code>remeasure</code>, and it measures the next group
		again, whatever the parent's mode is. The reason is that the space left on the line changes after a newline.
	</p>
	<p>
		To decide a group, the printer first reads <code>will_break</code>. A group is in break mode, whatever the width, when it contains
		a hardline, a breakParent, or a group that was set to break from the start (<code>group_broken</code>). Choose “hardline” in the
		figure to see the outer group decided as <code>broken</code>.
	</p>
	<p>
		For this decision, Prettier walks the tree once with <code>propagateBreaks</code> before printing, and it rewrites the
		<code>break</code> of each group. The kernel does this work when it makes nodes. A node can refer only to nodes made before it, so
		the answers of the children are known when the parent is made. <code>push</code> stores the node, and it also pushes the answer of
		<code>breaks_of</code> onto <code>breaks</code>.
	</p>
</div>

<Code item={data.code.push} mark={['self.breaks.push(breaks);']} />

<Code item={data.code.breaksOf} mark={['} => breaks_line || any(self.children(start, len)),']} />

<div class="prose-learn">
	<p>
		Before this, a separate pass, <code>propagate_breaks</code>, read the whole tree before printing, and it counted only hardlines and
		breakParents. Because of this, the input
		<code>group(["x", line, group(["y"], {'{'} shouldBreak: true {'}'})])</code> gave a different result. Prettier 3.9.9 breaks it into
		<code>x\ny</code>. The kernel printed <code>x y</code>. When we moved the count to the time a node is made, we also started to count
		groups that have <code>breaks_line</code> set. In the Svelte test corpus, the formatted output changed for 37 files, and 35 of them
		now match the official tool that we compare against. No file that matched before stopped matching (708a4403d5).
	</p>
</div>

<Code item={data.code.builtBrokenTest} />

<div class="prose-learn">
	<H2 id="fits" />
	<p>
		<code>fits</code> counts how many columns the content uses when it is printed flat. It does not count only the contents of the
		group. It also counts the commands that are still on the stack after the group (<dfn>rest commands</dfn>), until it reaches the
		first line break.
	</p>
</div>

<Code item={data.code.fits} />
<Code item={data.code.fitsIn} mark={['rest_i -= 1;', 'if must_be_flat && breaks_line {', 'if mode == Mode::Break || matches!(kind, LineKind::Hard | LineKind::Literal)']} />

<div class="prose-learn">
	<p>
		The printer calls <code>fits</code> each time it decides a group. So for its work list, <code>fits</code> reuses the
		<code>scratch</code> vector that <code>Printer</code> holds, and it does not allocate a new one for each call. The counting itself
		is in <code>fits_in</code>.
	</p>
	<p>
		For example, whether the group of <code>f(a, b);</code> fits depends on everything up to the <code>;</code> after the closing
		parenthesis. If the printer read only the group and decided that it fits, the <code>;</code> would go past the width. Rest commands
		are counted in their own mode. So when the count reaches a line in break mode, it returns true, because the line can break there.
	</p>

	<H2 id="fill" />
	<p>
		<dfn>fill</dfn> puts as many items on a line as fit, and then breaks the line, the same way words fill the lines of a paragraph. Its
		children alternate as “content, separator, content, separator, …”, and the printer decides them two at a time.
	</p>
</div>

<Code item={data.code.fill} />

<div class="prose-learn">
	<p>
		A separator is flat when the triple <strong>[content, separator, next content]</strong> fits flat. For this check, the printer
		calls <code>fits</code> with <code>must_be_flat</code>. If the content holds a group with a forced line break, <code>fits</code>
		answers “does not fit” at that point.
	</p>

	<DeepDive title="mustBeFlat had no test">
		<p>
			While we wrote this material, we found that every Rust test still passed after we deleted the <code>must_be_flat</code> branch.
			No test could tell whether the branch was there. So we added a Rust test for a fill whose content holds a group with a forced
			line break. The figure in the browser runs the same Rust printer as WebAssembly, so it runs the implementation that this test
			protects.
		</p>
		<p>
			Without the branch, the separator check counts a line of the inner group as a line in break mode and returns true. The separator
			then becomes flat (<code>b c</code> end up on the same line).
		</p>
	</DeepDive>
</div>

<Code item={data.code.mustBeFlatTest} />

<DocumentPrinter label="Figure 8.2 · mustBeFlat" presets={[mustBeFlat]} />

<div class="prose-learn">
	<H2 id="group-ids" />
	<p>
		<code>if_break</code> prints its first part when the enclosing group is in break mode, and its second part when that group is flat.
		<code>if_break_of</code> does not follow the enclosing group. It follows the mode of the group that a name (a group id) points to.
	</p>
</div>

<Code item={data.code.ifBreakBranch} />

<div class="prose-learn">
	<p>
		When the printer decides a named group, it records the mode of that group in <code>group_modes</code>. A reference to a group that
		the printer has not decided yet is treated as flat<Note
			>Prettier's <code>printDocToString</code> also treats a group that is not decided yet as flat.</Note
		>. <code>indent_if_break</code> reads the same table, and it indents only when the named group is in break mode.
	</p>

	<H2 id="flat-only" />
	<p>
		The kernel's printer has exactly one element that Prettier does not have: <dfn>flat_only</dfn>.
	</p>
</div>

<Code item={data.code.flatOnly} />

<div class="prose-learn">
	<p>
		The formatter port is not complete. For some syntax, the layout with line breaks is not ported yet. When you wrap such syntax in
		flat_only, the printer prints it correctly on 1 line while it fits the width. When it does not fit, the printer refuses to print
		anything (<code>Refused</code>). If the printer broke the lines in some way that only looks right, it would print a layout that
		Prettier does not print. This brings the rule “do not approximate” from Chapter
		<a href="/en/learn/kernel/diagnostics#unsupported">07</a> into the printer. Choose “flat_only” in Figure 8.1 and make the width
		smaller to see it.
	</p>
</div>

<Code item={data.code.print} mark={['if p.refused { Err(Refused) } else { Ok(p.out) }']} />

<div class="prose-learn">
	<p>
		<code>print</code> stops printing as soon as it finds that a <code>flat_only</code> does not fit. The caller gets only
		<code>Refused</code> in that case, so printing the rest would be wasted work.
	</p>
	<p>
		At each line break, the printer removes spaces and tabs at the end of the line (except after a literalline).
	</p>
</div>

<Code item={data.code.newline} />

<div class="prose-learn">
	<p>
		The Rust crate <code>unicode-width</code> gives the width. It handles East Asian width, and also sequences inside a string, such as
		combining characters and emoji joined by zero-width joiners. So this project does not need to generate and keep its own Unicode
		tables. These rules give a stable estimate of the number of columns in a terminal-like display. They do not try to match the width
		that a font actually draws, or to match the historical rules of Prettier exactly.<Note
			>The printer in the browser in this material (Figure 8.1) also uses the same Rust <code>string_width</code> through WebAssembly.</Note
		>
	</p>
	<p>
		The crate owns the Unicode data and the rules for sequences of characters. The tests in this repository check the meanings that we
		need: basic characters such as letters and digits, Chinese, Japanese, and Korean text, combining characters, and emoji.
		<code>Cargo.lock</code> pins the version of the dependency, so the formatting results of the same tree can be reproduced.
	</p>
</div>

<Code item={data.code.stringWidth} />

<div class="prose-learn">
	<H2 id="mutation" />
	<p>
		The nodes in the arena look as if they never change after they are made. But in some places, they do change.
	</p>
	<ul>
		<li>
			<code>trim_left</code> and <code>trim_right</code> are ports of <code>trim</code> from prettier-plugin-svelte. They use
			<code>replace_parts</code> to replace the child list of an existing node.
		</li>
		<li><code>remove_lines</code> does the opposite: it leaves the original node unchanged and returns a new node.</li>
	</ul>
</div>

<Code item={data.code.replaceParts} />

<div class="prose-learn">
	<p>
		Prettier runs <code>propagateBreaks</code> just before printing, so it counts again on the tree after trimming.
		<Term name="LayoutInstructions" />, however, decides <code>will_break</code> when it makes a node. So after
		<code>replace_parts</code> replaces a child list, it counts the answer of the owner again. Removing children never adds a break, so it
		counts again only when the old answer was true. Trimming replaces lists from the inside out, so the answers of the children are up
		to date at that point. Before this fix, there was no recount, and a group whose hardline had been removed was still printed as broken
		(e8196d855b). No formatter output in the fixtures reaches this case (0 of 105,387 outputs changed). The unit test
		<code>a_trimmed_hard_line_no_longer_breaks</code>, which fails without the fix, protects it.
	</p>
</div>

<Caution>
	If the same node is shared by two places in the tree, a <code>trim</code> meant for one place also changes the other. Nodes are
	handed out as <code>Copy</code> identifiers, so sharing happens without any effort. We still do not copy nodes, because upstream
	prettier-plugin-svelte also changes arrays in place, and we want the output for shared docs to match upstream (Chapter
	<a href="/en/learn/polish#correctness">14</a>).
</Caution>

<ChapterFooter chapter={c} />
