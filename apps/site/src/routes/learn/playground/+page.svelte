<script lang="ts">
	import PipelinePlayground from '$lib/widgets/PipelinePlayground.svelte';
</script>

<svelte:head><title>プレイグラウンド — rsvelte Learn</title></svelte:head>

<header class="playground-header">
	<div><a href="/learn">Learn</a><span aria-hidden="true">/</span><h1>プレイグラウンド</h1></div>
	<p>プラグインを付け外しして、Svelte と Vue のソース・解析結果・出力を比べます。</p>
</header>

<PipelinePlayground />

<footer class="playground-footer">
	<span>Rust を WebAssembly で実行</span>
	<nav aria-label="関連する解説"><a href="/learn/kernel/pipeline">パイプラインの仕組み</a><a href="/learn/kernel/database">解析結果の共有</a><a href="/learn/playground/doc">整形の判断を試す</a></nav>
</footer>

<style>
	.playground-header { margin-bottom: 22px; }
	.playground-header > div { display: flex; align-items: center; gap: 13px; }
	.playground-header a, .playground-header span { font-size: 13px; color: var(--muted); }
	h1 { font-size: 21px; font-weight: 600; letter-spacing: -.025em; }
	.playground-header p { margin-top: 11px; font-size: 13px; line-height: 1.8; color: var(--muted); }
	.playground-footer { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-top: 16px; font-size: 11px; color: var(--muted); }
	nav { display: flex; flex-wrap: wrap; gap: 20px; }
	a:hover { color: var(--fg); }
</style>
