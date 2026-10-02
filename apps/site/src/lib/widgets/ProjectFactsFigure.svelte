<script lang="ts">
	const cases = [
		{ label: '全呼び出しで同じ定数', code: '<Badge tone="quiet" />', fact: '全呼び出しで tone = "quiet" を確認', result: 'propsの定数化の安全条件を検証', detail: '全呼び出し箇所を列挙できるという前提で、リテラルの一致を確認した状態です。子コンポーネントでの再代入、$bindable、デフォルト値の副作用などを検証してから、構文木の変換を判断します。', known: true },
		{ label: '動的なprops', code: '<Badge tone={currentTone} />', fact: 'currentTone の値を静的に確定できない', result: 'tone の受け取り方を変えない', detail: 'この設計では、識別子で渡された値を定数とは判定しません。ほかの呼び出しがリテラルでも、tone が全呼び出しで同じ値であるとは証明できません。', known: false },
		{ label: '属性のスプレッド', code: '<Badge {...settings} />', fact: 'tone が含まれるか確定できない', result: 'propsの定数化を適用しない', detail: 'スプレッドされたオブジェクトは tone を含む可能性があります。設計では、いずれかの呼び出しにスプレッドがあれば、そのコンポーネントに渡されるpropsの情報を不明として扱います。', known: false },
		{ label: '外部にexportする', code: 'export { default as Badge } from "./Badge.svelte";', fact: 'プロジェクト外の呼び出しを列挙できない', result: 'このコンポーネントを最適化しない', detail: 'エントリーモジュールからexportされたコンポーネントは、外部のコードから別のpropsで呼ばれる可能性があります。内部の呼び出しだけを根拠に、propsを定数化しません。', known: false }
	];
	let choice = $state(0);
	const current = $derived(cases[choice]);
</script>

<figure aria-label="呼び出し元の違いによる、最適化の判断の変化">
	<figcaption>呼び出し箇所の解析結果と、propsの定数化の判定</figcaption>
	<div class="controls" role="group" aria-label="呼び出し元の条件">
		{#each cases as example, index}
			<button type="button" aria-pressed={choice === index} onclick={() => choice = index}>{example.label}</button>
		{/each}
	</div>
	<div class="graph">
		<div class="callers">
			<div><span>呼び出し元 A</span><code>&lt;Badge tone="quiet" /&gt;</code></div>
			<div><span>呼び出し元 B / エントリーモジュール</span><code>{current.code}</code></div>
		</div>
		<div class="arrow" aria-hidden="true">→</div>
		<div class="component"><span>Badge.svelte</span><code>let &#123; tone = "quiet" &#125; = $props();</code><code>&lt;span class=&#123;tone&#125;&gt;保存済み&lt;/span&gt;</code></div>
	</div>
	{#key choice}
		<div class="decision" class:known={current.known} aria-live="polite">
			<p class="fact">{current.fact}</p>
			<p class="result">{current.result}</p>
			<p>{current.detail}</p>
		</div>
	{/key}
	<p class="caption">未実装の設計を説明するモデルです。コードをコンパイルするものではありません。定数の一致と、構文木の変換の安全条件は別に検証します。</p>
</figure>

<style>
	figure { border: 1px solid var(--border); border-radius: 12px; padding: clamp(16px, 3vw, 28px); background: var(--sunken); }
	figcaption { font-weight: 600; }
	.controls { display: flex; flex-wrap: wrap; gap: 8px; margin: 20px 0 28px; }
	button { font-size: 13px; padding: 8px 12px; border: 1px solid var(--border-strong); border-radius: 6px; cursor: pointer; }
	button[aria-pressed='true'] { border-color: var(--accent); color: var(--accent); background: var(--accent-wash); }
	.graph { display: grid; grid-template-columns: minmax(0, 1fr) 36px minmax(0, 1fr); align-items: center; }
	.callers { display: grid; gap: 12px; }
	.callers > div, .component { min-width: 0; border: 1px solid var(--border); border-radius: 8px; padding: 16px; background: var(--bg); }
	.component { border-color: var(--accent); }
	.graph span { display: block; font-size: 12px; color: var(--muted); margin-bottom: 10px; }
	code { display: block; font-size: 12px; overflow-wrap: anywhere; }
	.arrow { text-align: center; color: var(--accent); }
	.decision { margin-top: 24px; padding: 18px; border-left: 3px solid var(--border-strong); background: var(--bg); font-size: 14px; line-height: 1.9; animation: reveal 220ms ease-out; }
	.decision.known { border-color: var(--accent); }
	.fact { color: var(--muted); font-size: 12px; }
	.result { font-size: 17px; font-weight: 600; margin: 4px 0 8px; }
	.caption { margin-top: 18px; font-size: 12px; line-height: 1.8; color: var(--muted); }
	@keyframes reveal { from { opacity: 0.4; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
	@media (max-width: 700px) { .graph { grid-template-columns: 1fr; gap: 12px; } .arrow { transform: rotate(90deg); } }
	@media (prefers-reduced-motion: reduce) { .decision { animation: none; } }
</style>
