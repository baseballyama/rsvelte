<script lang="ts">
	import GuideCode from '$lib/components/GuideCode.svelte';
	import { guideExamples, guideSectionsIn } from '$lib/guide';
	import { REPO_URL } from '$lib/site';
</script>

<svelte:head>
	<title>Usage guide — rsvelte</title>
	<meta name="description" content="Try rsvelte in the browser, compile, format, and check Svelte files on your computer, and use rsvelte in a web app." />
</svelte:head>

<main class="mx-auto max-w-[1200px] px-4 py-10 md:px-8 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 lg:py-14">
	<aside class="hidden lg:block">
		<nav class="rounded-lg border border-line bg-sunken p-4 lg:sticky lg:top-24" aria-label="Guide contents">
			<p class="mb-3 text-[14px] font-medium">Usage guide</p>
			<ol class="space-y-1">
				{#each guideSectionsIn('en') as section}
					<li><a class="block rounded px-2 py-1.5 text-[14px] text-fg-2 hover:bg-surface hover:text-fg" href="#{section.id}">{section.title}</a></li>
				{/each}
			</ol>
			<a class="mt-5 block border-t border-line pt-4 text-[13px] text-accent hover:underline" href="/en/learn">Learn how it works inside</a>
		</nav>
	</aside>
	<nav class="mb-8 lg:hidden" aria-label="Guide contents">
		<details class="rounded-lg border border-line bg-sunken px-4 py-3">
			<summary class="cursor-pointer text-[14px] font-medium">On this page</summary>
			<ol class="mt-3 space-y-1">
				{#each guideSectionsIn('en') as section}
					<li><a class="block rounded px-2 py-1.5 text-[14px] text-fg-2 hover:bg-surface hover:text-fg" href="#{section.id}">{section.title}</a></li>
				{/each}
			</ol>
		</details>
	</nav>

	<article class="min-w-0 max-w-[760px]">
		<header class="mb-10">
			<p class="eyebrow">Using rsvelte</p>
			<h1 class="mt-3 text-[34px] leading-tight font-semibold sm:text-[42px]">Usage guide</h1>
			<p class="mt-5 text-[17px] leading-[1.9] text-fg-2">This guide shows how to compile, format, and check Svelte source. You do not need to read any Rust code. To use rsvelte on your computer, you build the program from source.</p>
			<p class="mt-4 text-[14px] leading-[1.8] text-muted">This guide covers the code on the <code>experimental</code> branch. Some syntax is not supported yet, and some results differ from the official tools.</p>
		</header>

		<div class="prose-learn">
			<section id="try">
				<h2>{guideSectionsIn('en')[0].title}</h2>
				<p>The <a href="/en/learn/playground">playground</a> lets you try compiling, formatting, and checking without installing anything. Select Svelte, enter your source, and select the steps to run.</p>
				<p>The playground shows the generated files and the diagnostics. A diagnostic is a message about a problem in the source or about syntax that rsvelte does not support. Type checking does not run in the browser.</p>
			</section>

			<section id="setup">
				<h2>{guideSectionsIn('en')[1].title}</h2>
				<p>Install Git and the Rust development tools. Use the Rust version that <code>rust-toolchain.toml</code> in the repository names. Run these commands in a terminal:</p>
				<GuideCode code={guideExamples.setup} label="Get the source and build it" />
				<p>Run all later commands in the <code>rsvelte</code> directory that you cloned. On Windows, replace the program path with <code>.\target\release\rsvelte.exe</code>. To run a command that spans several lines, remove the <code>\</code> at each line end and join the lines into 1 line.</p>
				<p>Save this source as <code>Counter.svelte</code>. It is a Svelte 5 component with a number that goes up each time you click the button.</p>
				<GuideCode code={guideExamples.source} label="Counter.svelte" />
			</section>

			<section id="compile">
				<h2>{guideSectionsIn('en')[2].title}</h2>
				<p>To generate JavaScript that runs in the browser, run this command:</p>
				<GuideCode code={guideExamples.compile} label="Compile for the browser" />
				<p>The output starts with the label <code>// svelte.compile/client js</code>, followed by the JavaScript. To generate the page markup on a server, select this task instead:</p>
				<GuideCode code={guideExamples.server} label="Compile for the server" />
				<p>Name the task with <code>--task</code>. The command prints the content of each generated file to standard output. It does not change the input file.</p>
				<p>Styles and position mappings can also appear in the same standard output, each with its own label. Saving the whole output as one JavaScript file is not supported. To run an app, you also need the Svelte runtime library and a build setup in your app.</p>
			</section>

			<section id="format">
				<h2>{guideSectionsIn('en')[3].title}</h2>
				<p>To print the formatted source, run this command:</p>
				<GuideCode code={guideExamples.format} label="Format the source" />
				<p>The formatted source follows <code>// svelte.format/default svelte</code>. Check it, then copy the source without the label into your input file. No option overwrites the file for you.</p>
			</section>

			<section id="lint">
				<h2>{guideSectionsIn('en')[4].title}</h2>
				<p>To check the source for problems, run this command:</p>
				<GuideCode code={guideExamples.lint} label="Check the source" />
				<p>The result follows <code>// svelte.lint/default lint.json</code>. <code>rules</code> lists the rules that ran, and <code>findings</code> lists the problems found. If <code>findings</code> is empty, this check found no problems.</p>
				<p>For example, if you remove <code>type="button"</code> from the example button, you get a <code>svelte/button-has-type</code> finding. It says that the button has no type. Read the <code>rule</code>, the <code>message</code>, and the start and end positions of the finding, then fix the source.</p>
				<p>To format and check in one run, repeat <code>--task</code>:</p>
				<GuideCode code={guideExamples.combined} label="Format and check in one run" />
				<p>Each task works on the original source. The check does not receive the formatted result.</p>
			</section>

			<section id="check">
				<h2>{guideSectionsIn('en')[5].title}</h2>
				<p>Type checking needs three things. The first is the native TypeScript program, version 7.1 or later. The second is the type definitions of the Svelte package. The third is the rsvelte program that maps positions (<code>rsvelte-typescript-content-mapper</code>). Get the native TypeScript separately from the classic TypeScript command that runs on Node.js. rsvelte looks for the position mapping program in <code>PATH</code>. If you put it somewhere else, set its path in the environment variable <code>RSVELTE_TYPESCRIPT_CONTENT_MAPPER</code>.</p>
				<p>If you do not have these yet, run the following commands in the rsvelte directory. The first command installs the position mapping program. The second gets TypeScript and Svelte; this TypeScript is the version that the repository's own checks use. The last command prints the absolute path of the native program for your system.</p>
				<GuideCode code={guideExamples.checkSetup} label="Get the packages for type checking" />
				<p>With these steps, <code>typecheck-tools/node_modules/svelte</code> is the directory of the type definitions. To check an existing project, give the Svelte package that the project uses.</p>
				<p>Replace the content of <code>Counter.svelte</code> with the following. It assigns a string to a number variable, so you can see a type mismatch.</p>
				<GuideCode code={guideExamples.typedSource} label="Counter.svelte with a type mismatch" />
				<p>In the following command, replace the paths with the absolute paths of your programs, your Svelte package, and your project settings, then run it. Put quotes around any path that contains spaces.</p>
				<GuideCode code={guideExamples.check} label="Set up and run type checking" />
				<p><code>--tsc</code> is the TypeScript program, and <code>--svelte</code> is the directory of the Svelte package. The check uses the settings in the file that <code>--tsconfig</code> names.</p>
				<p>If your project has no settings file, leave out <code>--tsconfig</code> and its path.</p>
				<p>Type errors follow <code>// svelte.check/default json</code>. Missing settings and syntax that cannot be converted appear as separate diagnostics.</p>
				<p>In this example, you get error <code>2322</code>: a string cannot be assigned to the number type. Change <code>"zero"</code> to <code>0</code>, and the error goes away. Type checking counts lines and characters from 0.</p>
				<p>For Svelte, type checking currently covers only scripts with <code>lang="ts"</code>. Plain JavaScript scripts are not type checked.</p>
			</section>

			<section id="browser">
				<h2>{guideSectionsIn('en')[6].title}</h2>
				<p>To process source inside the browser, use the WebAssembly build. Run these commands at the root of the repository:</p>
				<GuideCode code={guideExamples.wasmBuild} label="Generate WebAssembly and the JavaScript glue files" />
				<p>The JavaScript, type definition, and WebAssembly files appear in <code>browser-package/</code> at the root. Put this directory in your web app and call it like this:</p>
				<GuideCode code={guideExamples.wasmUse} label="Compile and check from the browser" />
				<p>Call it from a page that a web server serves. <code>init()</code> waits until the WebAssembly loads. After that, <code>runPipeline()</code> returns the result as a string. Convert it to a JavaScript value with <code>JSON.parse()</code>, which reads JSON (JavaScript Object Notation) text.</p>
				<div class="overflow-x-auto">
					<table class="table">
						<caption class="mb-2 text-left text-[14px] text-fg-2">Arguments of <code>runPipeline</code></caption>
						<thead><tr><th>Position</th><th>Value</th></tr></thead>
						<tbody>
							<tr><td>1</td><td>The source text to process</td></tr>
							<tr><td>2</td><td>The file name with its extension, for example <code>App.svelte</code></td></tr>
							<tr><td>3</td><td>The language plugins to use, separated by commas, for example <code>svelte</code></td></tr>
							<tr><td>4</td><td>The steps to run, separated by commas</td></tr>
							<tr><td>5</td><td><code>true</code> to share analysis results within the same call</td></tr>
						</tbody>
					</table>
				</div>
				<p>Select steps from <code>compile-client</code>, <code>compile-server</code>, <code>format</code>, and <code>lint</code>. These names differ from the task names on the command line.</p>
				<p>If <code>ok</code> in the result is <code>false</code>, an argument or the run has a problem. Even when it is <code>true</code>, problems in the source can be reported. Also check <code>diagnostics</code> of each step in <code>steps</code>. The generated files are in <code>files</code>.</p>
				<p>Shared analysis results last only until the call ends. The next call does not get them. The browser build processes 1 file at a time. The input limit is 65,536 bytes of UTF-8 text (UTF-8 is the common byte encoding of Unicode). Type checking is not available in the browser build.</p>
			</section>

			<section id="limits">
				<h2>{guideSectionsIn('en')[7].title}</h2>
				<p>The compile examples in this guide use Svelte 5 runes. These steps do not cover the old Svelte 4 syntax, building a whole app, or connecting to Vite.</p>
				<p><code>run</code> processes 1 file. For syntax that is not supported, read the diagnostics. Results can differ from the official tools, so check the results on the files you want to process before you use rsvelte on an existing project.</p>
				<p>The exit code of the command alone does not tell you whether the source has problems. Today, <code>run</code> can exit normally even when it reports diagnostics. When you add it to automated checks, read the diagnostics and the type errors in the output.</p>
				<ul>
					<li>If a message says that the task name is unknown, compare your <code>--task</code> value with the one in this guide.</li>
					<li>If you get no output, check that the file extension matches the language of the task you selected.</li>
					<li>If type checking reports a settings error, check the paths of the programs and the packages.</li>
					<li>If the browser build does not load, check in the browser's developer tools that the JavaScript and WebAssembly files are served.</li>
				</ul>
				<p>To report a problem, open an issue in the <a href="{REPO_URL}/issues">GitHub issue list</a>. Include source that reproduces the problem, the command you ran, the output, and the commit you used. <code>git rev-parse HEAD</code> prints the commit.</p>
				<p>The <a href="/en/learn">guide for developers</a> explains how rsvelte works inside and how to add your own processing.</p>
			</section>
		</div>
	</article>
</main>

<style>
	section { scroll-margin-top: 6rem; }
	section + section { margin-top: 3.5rem; padding-top: 2rem; border-top: 1px solid var(--border); }
	section > :global(* + *) { margin-top: 1.25rem; }
	section > h2 { margin-top: 0; }
</style>
