<script lang="ts">
	import { resolve } from '$app/paths';
	import Logo from '#lib/Logo.svelte';
</script>

<svelte:head>
	<title>rsvelte</title>
	<meta name="description" content="Rust で書いた Svelte 5 のツールチェーン" />
</svelte:head>

<section class="hero">
	<Logo size="4.5rem" />
	<div>
		<h1>rsvelte</h1>
		<p class="lead">Svelte 5 のコード検査、整形、型検査をする Rust 製のツールです。</p>
	</div>
</section>

<p>実験段階のリリースです。結果が公式ツールと異なる場合があります。</p>

<pre><code
		>npm install --save-dev @rsvelte/cli
npx @rsvelte/cli lint
npx @rsvelte/cli format
npx @rsvelte/cli typecheck</code
	></pre>

<div class="cards">
	<div>
		<h3><code>lint</code></h3>
		<p>eslint-plugin-svelte などから移植したルールで、コードの問題を報告します。</p>
	</div>
	<div>
		<h3><code>format</code></h3>
		<p>oxfmt に Svelte の整形を組み込んだもので、ファイルを整形します。</p>
	</div>
	<div>
		<h3><code>typecheck</code></h3>
		<p>svelte-check と同じ型エラーを、TypeScript 7 系の型検査器（tsrs など）で報告します。</p>
	</div>
</div>

<p>
	対象は Svelte 5 のルーンモードのコンポーネントと、TypeScript と JavaScript のファイルです（<a
		href={resolve('/guide') + '#legacy'}>Svelte 4 の場合</a
	>）。
</p>

<p>
	<a href={resolve('/guide')}>使い方</a>を読むか、<a href={resolve('/playground')}
		>プレイグラウンド</a
	>でブラウザから試せます。
</p>

<style>
	.hero {
		display: flex;
		gap: 1.25rem;
		align-items: center;
		margin: 2.5rem 0 1.5rem;
	}

	h1 {
		margin: 0;
		font-size: 2.6rem;
	}

	.lead {
		margin: 0.25rem 0 0;
		font-size: 1.15rem;
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: 1rem;
		margin: 1.5rem 0;
	}

	.cards > div {
		padding: 0 1rem;
		border: 1px solid var(--line);
		border-radius: 8px;
	}
</style>
