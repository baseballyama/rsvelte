<script lang="ts">
	import Figure from '$lib/components/Figure.svelte';
	import { moduleDescription } from '$lib/module-descriptions';

	interface KernelModule {
		key: string;
		file: string;
		lines: number;
		title: string;
		summary: string;
		chapter?: { href: string; number: string };
	}

	let { modules }: { modules: KernelModule[] } = $props();
</script>

{#snippet group(name: string)}
	{@const key = `kernel/${name}`}
	<h3>{moduleDescription(key).title}</h3>
	<ul class="roles">
		{#each modules.filter(module => module.key.startsWith(`${key}/`)) as module (module.key)}
			<li>
				{#if module.chapter}
					<a href={module.chapter.href}>{module.title}<span aria-hidden="true"> ↗</span></a>
				{:else}
					<span>{module.title}</span>
				{/if}
			</li>
		{/each}
	</ul>
	<details>
		<summary>実装ファイルと行数</summary>
		<dl>
			{#each modules.filter(module => module.key === key || module.key.startsWith(`${key}/`)) as module (module.key)}
				<div>
					<dt><code>{module.file}</code><span class="lines">{module.lines} 行</span></dt>
					<dd>{module.summary}</dd>
				</div>
			{/each}
		</dl>
	</details>
{/snippet}

<Figure label="図 1.2 · モジュールの役割と関係">
	<div class="module-map">
		<div class="flow">
			<p class="endpoint">入力：文書と実行するタスク</p>
			<p class="connector"><span aria-hidden="true">↓</span> 文書ごとに処理を進める</p>
			<section class="execution">
				{@render group('computation')}
				<div class="plugin">
					<h4>言語プラグインの処理を呼び出す</h4>
					<p>構文解析・名前解決・コンパイル・整形・コード検査・型検査用コードの生成</p>
					<p class="shared">必要な計算結果を求める ↔ 保存した結果を再利用する</p>
				</div>
			</section>
			<p class="connector"><span aria-hidden="true">↓</span> 各処理で使う共通機能</p>
			<div class="results">
				<section>{@render group('output')}</section>
				<section>{@render group('diagnostics')}</section>
			</div>
			<p class="connector"><span aria-hidden="true">↓</span> 生成したファイルと診断をまとめる</p>
			<p class="endpoint">結果：呼び出し側へ返す</p>
		</div>
		<div class="support">
			<p class="support-label">上の処理を支える共通機能 <span aria-hidden="true">↑</span></p>
			<section>
				{@render group('source')}
				<p class="support-note">木や解析結果から、同じ位置と識別番号を参照します。</p>
			</section>
			<section>
				{@render group('performance')}
				<p class="support-note">実行する処理を計測し、作業用の保存領域を再利用します。</p>
			</section>
		</div>
	</div>
	{#snippet caption()}
		矢印は処理と結果の流れを表す概念図です。モジュール間の依存関係や、すべてのタスクが同じ順序で機能を使うことを表すものではありません。
		破線の枠はカーネルが呼び出す言語プラグインの処理です。
	{/snippet}
</Figure>

<style>
	.module-map { padding: clamp(16px, 3vw, 28px); font-size: 14px; line-height: 1.7; }
	.flow { display: flex; flex-direction: column; }
	section { min-width: 0; border: 1px solid var(--border-strong); border-radius: 8px; padding: 16px; background: var(--bg); }
	.execution { border-color: var(--accent); background: var(--accent-wash); }
	h3 { font-size: 16px; font-weight: 600; color: var(--fg); margin: 0 0 10px; }
	h4 { margin: 0 0 6px; font-size: 14px; font-weight: 600; }
	p { margin: 0; }
	.endpoint { align-self: center; padding: 8px 16px; border: 1px solid var(--border-strong); border-radius: 6px; background: var(--surface); text-align: center; font-weight: 500; }
	.connector { display: flex; justify-content: center; align-items: center; gap: 10px; padding: 10px 0; font-size: 12px; color: var(--fg-2); }
	.connector span { font-size: 22px; color: var(--accent); }
	.roles { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 6px 16px; }
	.roles li { min-width: 0; }
	a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
	a:focus-visible, summary:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
	.plugin { margin-top: 16px; padding: 14px; border: 1px dashed var(--border-strong); border-radius: 6px; background: var(--bg); }
	.plugin p { color: var(--fg-2); font-size: 13px; }
	.plugin .shared { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); color: var(--accent); }
	.results { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
	.support { margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border); display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
	.support-label { grid-column: 1 / -1; color: var(--fg-2); font-size: 12px; font-weight: 500; }
	.support-label span { color: var(--accent); }
	.support section { background: var(--surface); }
	.support-note { margin-top: 12px; color: var(--fg-2); font-size: 13px; }
	details { margin-top: 12px; font-size: 12px; }
	summary { cursor: pointer; color: var(--muted); }
	dl { margin: 10px 0 0; }
	dl > div { padding: 10px 0; border-top: 1px solid var(--border); }
	dt { display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; }
	code { overflow-wrap: anywhere; color: var(--fg); }
	.lines { color: var(--muted); white-space: nowrap; }
	dd { margin: 4px 0 0; color: var(--fg-2); }
	@media (max-width: 600px) { .results, .support { grid-template-columns: 1fr; } }
</style>
