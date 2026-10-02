<script lang="ts">
	const tasks = ['lint', 'format', 'compile'];
	let selected = $state([true, true, true]);
	let revision = $state(0);
	const count = $derived(selected.filter(Boolean).length);
</script>

<figure class="sharing" aria-label="別々のツールと、構文解析を共有する処理の比較">
	<figcaption>選択したタスクが、同じ文書の構文解析結果を共有する場合の依存関係</figcaption>
	<div class="controls">
		{#each tasks as task, index}
			<label><input type="checkbox" bind:checked={selected[index]} />{task}</label>
		{/each}
		<button type="button" onclick={() => revision += 1}>解析結果の取得を再生</button>
	</div>
	{#key `${selected.join()}-${revision}`}
		<div class="comparison">
			<div>
				<h3>独立したプロセスで実行</h3>
				{#each tasks as task, index}
					<div class="route" class:inactive={!selected[index]}>
						<span>同じソース</span><b aria-hidden="true">→</b><span class="parse">構文解析</span><b aria-hidden="true">→</b><span>{task}</span>
					</div>
				{/each}
				<p>構文解析は <strong>{count} 回</strong></p>
			</div>
			<div>
				<h3>同じ実行コンテキストで共有</h3>
				<div class="route" class:inactive={count === 0}>
					<span>ソース</span><b aria-hidden="true">→</b><span class="parse">構文解析</span><b aria-hidden="true">→</b><span>構文木をキャッシュ</span>
				</div>
				<div class="branches">
					{#each tasks as task, index}
						<span class:inactive={!selected[index]}><b aria-hidden="true">↳</b> {task}</span>
					{/each}
				</div>
				<p>構文解析は <strong>{count > 0 ? 1 : 0} 回</strong></p>
			</div>
		</div>
	{/key}
	<p class="caption" aria-live="polite">{count} 種類の処理を選択中。図は共有の仕組みを示すモデルです。アニメーションの長さは処理時間を表しません。</p>
</figure>

<style>
	.sharing { border: 1px solid var(--border); border-radius: 12px; background: var(--sunken); padding: clamp(16px, 3vw, 28px); }
	figcaption { font-weight: 600; }
	.controls { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; margin: 20px 0; font-size: 14px; }
	label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
	input { accent-color: var(--accent); width: 16px; height: 16px; }
	button { margin-left: auto; padding: 6px 12px; border: 1px solid var(--border-strong); border-radius: 6px; cursor: pointer; }
	button:hover { background: var(--surface); }
	.comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
	h3 { font-size: 14px; margin-bottom: 12px; color: var(--fg-2); }
	.route { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: center; gap: 6px; margin-bottom: 10px; font-size: 12px; }
	.route span { padding: 12px 4px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); text-align: center; }
	.route .parse { border-color: var(--accent); background: var(--accent-wash); animation: arrival 650ms ease-out; }
	b { color: var(--accent); }
	.branches { display: grid; gap: 8px; margin-left: 40%; font-size: 13px; }
	.inactive { opacity: 0.35; }
	.comparison p { margin-top: 18px; font-size: 14px; }
	strong { color: var(--accent); }
	.caption { margin-top: 20px; color: var(--muted); font-size: 12px; line-height: 1.8; }
	@keyframes arrival { from { transform: translateX(-8px); opacity: 0.25; } to { transform: translateX(0); opacity: 1; } }
	@media (max-width: 700px) { .comparison { grid-template-columns: 1fr; } .comparison > div + div { border-top: 1px solid var(--border); padding-top: 20px; } }
	@media (prefers-reduced-motion: reduce) { .route .parse { animation: none; } }
</style>
