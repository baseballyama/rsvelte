<script lang="ts">
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { appendixIn, chapter, chaptersIn } from '$lib/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const c = chapter('intro', 'en');
</script>

<svelte:head><title>Learn — rsvelte</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="This guide helps you read rsvelte_kernel, the kernel of rsvelte, from its overall shape down to single lines. Get the shape of the whole first, before you open the code. Then each chapter explores one module in depth."
/>

<div class="prose-learn">
	<H2 id="audience" />
	<p>If you want to process your files with rsvelte, start with the <a href="/en/guide">usage guide</a>.</p>
	<p>
		This guide is for people who change the kernel. It assumes that you can read Rust.
		Parsing builds a syntax tree from the source, formatting fixes spaces and line breaks, and linting points out problems.
		Compiling converts the source to the target language, and type checking tests whether the types of values and operations match.
		The kernel gives the machinery that runs these steps, and the shared parts that each language uses.
		Svelte and Vue appear as examples of language plugins. Each chapter explains what you need to know about a language where it is needed.
	</p>
	<p>
		The kernel is small: {data.kernelFiles} files and {data.kernelLines.toLocaleString('en-US')} lines, tests included<Note>The build counts <code>crates/kernel/src</code> again each time, so this number is current.</Note>. You can read any one of its files in one sitting.
		Still, the code alone does not show <em>why it was written that way</em> or <em>where it is weak</em>. This guide adds those two things.
	</p>

	<H2 id="honesty" />
	<p>What you find here is one of three kinds. Each place says which kind it is.</p>
	<ul>
		<li>
			<strong>Real code.</strong> The Rust excerpts in gray frames are cut by item name from
			<code>crates/</code> when the site is built. The line numbers are those of the file, and the link at the top right points to those lines at that commit. When an item is renamed, the build fails, so an old excerpt cannot stay on the site.
		</li>
		<li>
			<strong>Algorithms that run in the browser.</strong> The document printer is the Rust <code>rsvelte_kernel</code> compiled to WebAssembly
			and run as it is. So the printer itself and the text width calculation are the same in the native build and in the browser. LineIndex, Emitter, StructuredDataWriter, and Interner
			are ported to TypeScript line by line, and they are tested with the same inputs and expected values as the Rust tests. Only Interner uses a different hash function (not FxHash).
		</li>
		<li>
			<strong>Models.</strong> The figures of the scheduler timeline, the cache, and the buffer pool are models that copy the kernel's rules. Their numbers for time and memory are examples, not measurements. The measurements are in
			Chapter <a href="/en/learn/measure">13</a>. The site reads the number of checks against the performance baselines from <code>tools/performance/baseline.json</code>
			at build time, and each timing benchmark names the build it measured. Before-and-after numbers in the text are quoted from the message of the commit that made the change (a short commit identifier such as <code>a5822ee26f</code>).
		</li>
	</ul>

	<H2 id="path" />
	<p>
		Read Chapter <a href="/en/learn/kernel">01</a>, the kernel at a glance, first. After that, you can read the chapters in any order. Positions (02), computing each result once (04), and the scheduler (06) are the central mechanisms. The rest are parts that sit on top of them. The last one,
		Chapter <a href="/en/learn/polish">14</a>, collects in one place the weak points that the other chapters mention.
	</p>
	<p>Chapter <a href="/en/learn/plugins">15</a> shows how to add your own processing. It registers computed results and tasks with a language plugin example that you can run.</p>
</div>

<ol class="mt-10 border-t border-line">
	{#each chaptersIn('en').slice(1) as ch (ch.slug)}
		<li class="border-b border-line">
			<a href={ch.href} class="group grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-baseline gap-x-3 py-3">
				<span class="font-mono text-[13px] tracking-normal text-muted">{ch.number}</span>
				<span>
					<span class="block text-[16px] group-hover:text-accent">{ch.title}</span>
					<span class="mt-0.5 block text-[14px] leading-[1.6] text-muted">{ch.abstract}</span>
				</span>
				<span class="font-mono text-[12px] tracking-normal text-muted tnum">{ch.minutes} minutes</span>
			</a>
		</li>
	{/each}
	{#each appendixIn('en') as a (a.href)}
		<li class="border-b border-line">
			<a href={a.href} class="group grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-x-3 py-3">
				<span class="font-mono text-[13px] tracking-normal text-muted">Appendix</span>
				<span>
					<span class="block text-[16px] group-hover:text-accent">{a.title}</span>
					<span class="mt-0.5 block text-[14px] leading-[1.6] text-muted">{a.abstract}</span>
				</span>
			</a>
		</li>
	{/each}
</ol>

<ChapterFooter chapter={c} />
