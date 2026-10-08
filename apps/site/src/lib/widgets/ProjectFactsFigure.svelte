<script lang="ts">
	import { bilingual } from '$lib/i18n';
	import { readerLang } from '$lib/lang.svelte';

	const cases = [
		{
			code: '<Badge tone="quiet" />', known: true,
			label: bilingual('全呼び出しで同じ定数', 'Same constant in every call'),
			fact: bilingual('全呼び出しで tone = "quiet" を確認', 'Every call passes tone = "quiet"'),
			result: bilingual('propsの定数化の安全条件を検証', 'Check the safety conditions for making the prop a constant'),
			detail: bilingual('全呼び出し箇所を列挙できるという前提で、リテラルの一致を確認した状態です。子コンポーネントでの再代入、$bindable、デフォルト値の副作用などを検証してから、構文木の変換を判断します。', 'This case assumes that every call site can be listed, and the literals match. Before it rewrites the tree, the design checks reassignment in the child component, $bindable, side effects of default values, and similar conditions.')
		},
		{
			code: '<Badge tone={currentTone} />', known: false,
			label: bilingual('動的なprops', 'Dynamic props'),
			fact: bilingual('currentTone の値を静的に確定できない', 'The value of currentTone is not known before run time'),
			result: bilingual('tone の受け取り方を変えない', 'Keep the way tone is received'),
			detail: bilingual('この設計では、識別子で渡された値を定数とは判定しません。ほかの呼び出しがリテラルでも、tone が全呼び出しで同じ値であるとは証明できません。', 'This design does not treat a value passed as an identifier as a constant. Even if the other calls pass literals, it cannot prove that tone has the same value in every call.')
		},
		{
			code: '<Badge {...settings} />', known: false,
			label: bilingual('属性のスプレッド', 'Attribute spread'),
			fact: bilingual('tone が含まれるか確定できない', 'It is not known whether tone is included'),
			result: bilingual('propsの定数化を適用しない', 'Do not make props constant'),
			detail: bilingual('スプレッドされたオブジェクトは tone を含む可能性があります。設計では、いずれかの呼び出しにスプレッドがあれば、そのコンポーネントに渡されるpropsの情報を不明として扱います。', 'The spread object might contain tone. In this design, if any call uses a spread, the props passed to that component are treated as unknown.')
		},
		{
			code: 'export { default as Badge } from "./Badge.svelte";', known: false,
			label: bilingual('外部にexportする', 'Exported to other code'),
			fact: bilingual('プロジェクト外の呼び出しを列挙できない', 'Calls from outside the project cannot be listed'),
			result: bilingual('このコンポーネントを最適化しない', 'Do not optimize this component'),
			detail: bilingual('エントリーモジュールからexportされたコンポーネントは、外部のコードから別のpropsで呼ばれる可能性があります。内部の呼び出しだけを根拠に、propsを定数化しません。', 'Code outside the project might call a component that the entry module exports, with other props. The design does not make props constant based only on the calls inside the project.')
		}
	];
	const text = bilingual({
		figure: '呼び出し元の違いによる、最適化の判断の変化',
		caption: '呼び出し箇所の解析結果と、propsの定数化の判定',
		conditions: '呼び出し元の条件',
		callerA: '呼び出し元 A',
		callerB: '呼び出し元 B / エントリーモジュール',
		saved: '保存済み',
		note: '未実装の設計を説明するモデルです。コードをコンパイルするものではありません。定数の一致と、構文木の変換の安全条件は別に検証します。'
	}, {
		figure: 'How the optimization decision changes with the callers',
		caption: 'Call site facts and the decision to make props constant',
		conditions: 'Caller conditions',
		callerA: 'Caller A',
		callerB: 'Caller B / entry module',
		saved: 'Saved',
		note: 'A model of a design that is not implemented. It does not compile code. Matching constants and the safety conditions for rewriting the tree are checked separately.'
	});
	const lang = $derived(readerLang());
	const t = $derived(text[lang]);
	let choice = $state(0);
	const current = $derived(cases[choice]);
</script>

<figure aria-label={t.figure}>
	<figcaption>{t.caption}</figcaption>
	<div class="controls" role="group" aria-label={t.conditions}>
		{#each cases as example, index}
			<button type="button" aria-pressed={choice === index} onclick={() => choice = index}>{example.label[lang]}</button>
		{/each}
	</div>
	<div class="graph">
		<div class="callers">
			<div><span>{t.callerA}</span><code>&lt;Badge tone="quiet" /&gt;</code></div>
			<div><span>{t.callerB}</span><code>{current.code}</code></div>
		</div>
		<div class="arrow" aria-hidden="true">→</div>
		<div class="component"><span>Badge.svelte</span><code>let &#123; tone = "quiet" &#125; = $props();</code><code>&lt;span class=&#123;tone&#125;&gt;{t.saved}&lt;/span&gt;</code></div>
	</div>
	{#key choice}
		<div class="decision" class:known={current.known} aria-live="polite">
			<p class="fact">{current.fact[lang]}</p>
			<p class="result">{current.result[lang]}</p>
			<p>{current.detail[lang]}</p>
		</div>
	{/key}
	<p class="caption">{t.note}</p>
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
