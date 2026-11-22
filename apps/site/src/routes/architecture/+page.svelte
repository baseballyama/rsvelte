<svelte:head>
	<title>Architecture · rsvelte</title>
</svelte:head>

<h1>Architecture</h1>

<p>An overview for contributors.</p>

<h2 id="flow">Parse once, share the results</h2>

<ol>
	<li>
		A parser reads the source and builds syntax trees. rsvelte parses JavaScript and TypeScript with <a
			href="https://oxc.rs/">oxc</a
		>. After parsing, nothing changes a tree, with one exception: the semantic analysis of oxc
		writes scope and symbol IDs into the trees of oxc.
	</li>
	<li>
		Semantic analysis records facts, such as the scope of each variable, in tables beside the trees.
		A database per file holds the trees and the tables.
	</li>
	<li>
		A plugin, such as the Svelte linter, adds tasks. A task is one job that runs on each file. Its
		name is the plugin's name and a kind:
		<code>svelte.lint/default</code> is the lint task of the <code>svelte.lint</code> plugin. A task
		asks the database for the results it needs. The database computes a missing result once and
		shares it with the other tasks of that file.
	</li>
	<li>
		Each worker thread takes one file at a time, so files run in parallel. A type check task also
		runs once after all files, to check the whole project.
	</li>
</ol>

<h2 id="crates">Crates</h2>

<table>
	<thead>
		<tr><th>Directory</th><th>What it holds</th></tr>
	</thead>
	<tbody>
		<tr>
			<td><code>crates/language_independent/</code></td>
			<td>
				Code that does not depend on a language: the database and the task scheduler (<code
					>kernel</code
				>), and the interface between hosts and plugins (<code>plugin_interface</code>). It also
				holds documents, positions and diagnostics, and the shared code of lint tools, formatters
				and test runners.
			</td>
		</tr>
		<tr>
			<td><code>crates/languages/&lt;language&gt;/</code></td>
			<td>
				Each language's parser and analysis, and its tools: <code>compile</code>, <code>lint</code>,
				<code>format</code> and <code>check</code>.
			</td>
		</tr>
		<tr>
			<td><code>crates/bridges/</code></td>
			<td>
				Cross-framework compilers, such as one that compiles Vue components for the Svelte runtime.
				The
				<code>rsvelte</code> command does not include them.
			</td>
		</tr>
		<tr>
			<td><code>crates/hosts/</code></td>
			<td>
				Programs that combine plugins and run them: the <code>rsvelte</code> command (<code
					>command_line</code
				>) and the WebAssembly build (<code>browser</code>).
			</td>
		</tr>
	</tbody>
</table>

<p>
	Each tool is a crate that registers its tasks, such as <code>svelte.compile/client</code>.
	<code>rsvelte format</code> is the one command without tasks: it runs oxfmt's file handling, which
	calls the Svelte formatter.
</p>

<h2 id="typecheck">Type checking</h2>

<p>
	<code>typecheck</code> turns each Svelte component into TypeScript code. It passes that code and a
	map back to the original positions to the TypeScript 7 type checker. The checker uses the map to
	report each error at its position in the Svelte file. The conversion lives in
	<code>crates/languages/svelte/typescript_projection</code>.
</p>

<h2 id="correctness">Comparison with the official tools</h2>

<p>
	<code>corpus/</code> holds real Svelte 5 files from projects under permissive licenses, such as
	MIT, and files written for this project. The official tools, such as svelte and svelte-check,
	produce the expected output.
</p>

<p>
	<code>cargo test</code> compares rsvelte's output with the expected output. A ledger (<code
		>corpus/_registry/parity/</code
	>) records, for each task, whether each file matches: its verdict. When a verdict changes, the
	test fails. To accept an intended change, run it with <code>UPDATE_EXPECT=1</code>.
</p>

<h2 id="contribute">Contributing</h2>

<pre><code class="language-sh"
		>{`cargo test                                        # the Rust tests
cargo test -p rsvelte_command_line --test corpus  # the comparison with the official tools
pnpm install && pnpm run check                    # the TypeScript side`}</code
	></pre>

<p>
	<a href="https://github.com/baseballyama/rsvelte/blob/main/AGENTS.md"><code>AGENTS.md</code></a>
	has the rules for contributors, and
	<a href="https://github.com/baseballyama/rsvelte/blob/main/crates/README.md"
		><code>crates/README.md</code></a
	> describes the crates.
</p>
