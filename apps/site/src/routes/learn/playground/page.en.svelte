<script lang="ts">
	import PipelinePlayground from '$lib/widgets/PipelinePlayground.svelte';
</script>

<svelte:head><title>Playground — rsvelte Learn</title></svelte:head>

<header class="playground-header">
	<div><a href="/en/learn">Learn</a><span aria-hidden="true">/</span><h1>Playground</h1></div>
	<p>Run Svelte and Vue sources through the Rust pipeline in your browser. In the work log below, compare which task computed which analysis result and which results it reused.</p>
</header>

<PipelinePlayground />

<footer class="playground-footer">
	<span>Rust runs as WebAssembly. Your source never leaves the browser.</span>
	<nav aria-label="Related explanations"><a href="/en/learn/kernel#overview">Overview of the kernel and plugins</a><a href="/en/learn/kernel/pipeline">How the pipeline works</a><a href="/en/learn/kernel/database">Sharing analysis results</a><a href="/en/learn/playground/doc">Try formatting decisions</a></nav>
</footer>

<style>
	.playground-header { margin-bottom: 18px; }
	.playground-header > div { display: flex; align-items: center; gap: 13px; }
	.playground-header a, .playground-header span { font-size: 13px; color: var(--muted); }
	h1 { font-size: 21px; font-weight: 600; letter-spacing: -.025em; }
	.playground-header p { margin-top: 9px; font-size: 13px; line-height: 1.8; color: var(--muted); }
	.playground-footer { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-top: 16px; font-size: 11px; color: var(--muted); }
	nav { display: flex; flex-wrap: wrap; gap: 20px; }
	a:hover { color: var(--fg); }
</style>
