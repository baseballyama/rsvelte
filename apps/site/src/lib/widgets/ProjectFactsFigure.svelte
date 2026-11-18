<script lang="ts">
	const cases = [
		{
			label: '全呼び出しで同じ定数',
			code: '<Badge tone="quiet" />',
			fact: 'すべての呼び出しが tone = "quiet" を渡す',
			result: 'props を定数にしても安全かを検証する',
			detail:
				'呼び出し箇所をすべて列挙でき、渡すリテラルも一致しています。子コンポーネントでの再代入、$bindable、デフォルト値の副作用を調べてから、構文木を変換するかを決めます。',
			known: true,
		},
		{
			label: '変数で渡す props',
			code: '<Badge tone={currentTone} />',
			fact: 'currentTone の値はコンパイル前に決まらない',
			result: 'tone の受け取り方を変えない',
			detail:
				'この設計では、識別子で渡した値を定数とみなしません。ほかの呼び出しがリテラルでも、tone がすべての呼び出しで同じ値だとは証明できません。',
			known: false,
		},
		{
			label: '属性のスプレッド',
			code: '<Badge {...settings} />',
			fact: 'tone が含まれるかが決まらない',
			result: 'props を定数にしない',
			detail:
				'どれか一つの呼び出しにスプレッドがあれば、そのコンポーネントに渡す props を不明として扱います。',
			known: false,
		},
		{
			label: '外部に export する',
			code: 'export { default as Badge } from "./Badge.svelte";',
			fact: 'プロジェクトの外からの呼び出しは列挙できない',
			result: 'このコンポーネントは最適化しない',
			detail:
				'エントリーモジュールから export したコンポーネントは、外部のコードから別の props で呼ばれることがあります。内部の呼び出しだけを根拠に props を定数にはしません。',
			known: false,
		},
	];
	let choice = $state(0);
	const current = $derived(cases[choice]);
</script>

<figure aria-label="呼び出し元によって変わる最適化の判断">
	<figcaption>呼び出し箇所の解析結果と、props を定数にするかの判定</figcaption>
	<div class="controls" role="group" aria-label="呼び出し元の条件">
		{#each cases as example, index}
			<button type="button" aria-pressed={choice === index} onclick={() => (choice = index)}
				>{example.label}</button
			>
		{/each}
	</div>
	<div class="graph">
		<div class="callers">
			<div><span>呼び出し元 A</span><code>&lt;Badge tone="quiet" /&gt;</code></div>
			<div>
				<span>呼び出し元 B（export の例ではエントリーモジュール）</span><code>{current.code}</code>
			</div>
		</div>
		<div class="arrow" aria-hidden="true">→</div>
		<div class="component">
			<span>Badge.svelte</span><code>let &#123; tone = "quiet" &#125; = $props();</code><code
				>&lt;span class=&#123;tone&#125;&gt;保存済み&lt;/span&gt;</code
			>
		</div>
	</div>
	{#key choice}
		<div class="decision" class:known={current.known} aria-live="polite">
			<p class="fact">{current.fact}</p>
			<p class="result">{current.result}</p>
			<p>{current.detail}</p>
		</div>
	{/key}
	<p class="caption">上のボタンで呼び出し元 B のコードを切り替えると、判定が変わります。</p>
</figure>

<style>
	figure {
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: clamp(16px, 3vw, 28px);
		background: var(--sunken);
	}
	figcaption {
		font-weight: 600;
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin: 20px 0 28px;
	}
	button {
		font-size: 13px;
		padding: 8px 12px;
		border: 1px solid var(--border-strong);
		border-radius: 6px;
		cursor: pointer;
	}
	button[aria-pressed='true'] {
		border-color: var(--accent);
		color: var(--accent);
		background: var(--accent-wash);
	}
	.graph {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 36px minmax(0, 1fr);
		align-items: center;
	}
	.callers {
		display: grid;
		gap: 12px;
	}
	.callers > div,
	.component {
		min-width: 0;
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 16px;
		background: var(--bg);
	}
	.component {
		border-color: var(--accent);
	}
	.graph span {
		display: block;
		font-size: 12px;
		color: var(--muted);
		margin-bottom: 10px;
	}
	code {
		display: block;
		font-size: 12px;
		overflow-wrap: anywhere;
	}
	.arrow {
		text-align: center;
		color: var(--accent);
	}
	.decision {
		margin-top: 24px;
		padding: 18px;
		border-left: 3px solid var(--border-strong);
		background: var(--bg);
		font-size: 14px;
		line-height: 1.9;
		animation: reveal 220ms ease-out;
	}
	.decision.known {
		border-color: var(--accent);
	}
	.fact {
		color: var(--muted);
		font-size: 12px;
	}
	.result {
		font-size: 17px;
		font-weight: 600;
		margin: 4px 0 8px;
	}
	.caption {
		margin-top: 18px;
		font-size: 12px;
		line-height: 1.8;
		color: var(--muted);
	}
	@keyframes reveal {
		from {
			opacity: 0.4;
			transform: translateY(5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@media (max-width: 700px) {
		.graph {
			grid-template-columns: 1fr;
			gap: 12px;
		}
		.arrow {
			transform: rotate(90deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.decision {
			animation: none;
		}
	}
</style>
