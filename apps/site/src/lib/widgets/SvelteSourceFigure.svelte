<script lang="ts">
	import { bilingual } from '$lib/i18n';
	import { readerLang } from '$lib/lang.svelte';

	let { markup }: { markup: Record<string, string> } = $props();
	const text = bilingual({
		caption: 'テンプレートの変数を、スクリプトの宣言に対応付ける',
		script: 'スクリプト',
		scriptPurpose: '変数を宣言する',
		declaration: ' の宣言。テンプレート内の同名の識別子は、この宣言を参照する。',
		template: 'テンプレート',
		templatePurpose: '変数を参照し、入力値を書き戻す',
		showsBefore: '',
		showsMiddle: ' を表示し、',
		showsAfter: ' で入力値を書き戻す。',
		classNote: ' はスタイルのセレクターに対応するクラス。',
		style: 'スタイル',
		stylePurpose: 'クラスに対応する要素を指定する',
		selectorMiddle: ' はテンプレートの ',
		selectorAfter: ' に対応する。',
		variableLegend: '青：変数 name の宣言と参照',
		selectorLegend: '緑：クラス greeting とセレクター',
		oxlint: 'スクリプト内のJavaScriptを検査',
		rsvelte: 'テンプレートの変数参照と、スクリプトの宣言を名前解決で対応付ける'
	}, {
		caption: 'Matching template variables to script declarations',
		script: 'Script',
		scriptPurpose: 'Declares a variable',
		declaration: ' is declared here. Identifiers with the same spelling in the template refer to this declaration.',
		template: 'Template',
		templatePurpose: 'Reads the variable and writes the input value back',
		showsBefore: 'Shows ',
		showsMiddle: ', and ',
		showsAfter: ' writes the input value back.',
		classNote: ' is a class that a style selector matches.',
		style: 'Style',
		stylePurpose: 'Selects elements by their class',
		selectorMiddle: ' matches ',
		selectorAfter: ' in the template.',
		variableLegend: 'Blue: the declaration and references of the variable name',
		selectorLegend: 'Green: the class greeting and its selector',
		oxlint: 'Checks the JavaScript in the script',
		rsvelte: 'Uses name resolution to match variable references in the template to declarations in the script'
	});
	const t = $derived(text[readerLang()]);
</script>

<figure class="source-figure">
	<figcaption>{t.caption}</figcaption>
	<div class="source-regions">
		<div>
			<h3>{t.script}</h3>
			<p class="purpose">{t.scriptPurpose}</p>
			<div class="example">{@html markup.script}</div>
			<p><code class="variable">name</code>{t.declaration}</p>
		</div>
		<div>
			<h3>{t.template}</h3>
			<p class="purpose">{t.templatePurpose}</p>
			<div class="example">{@html markup.template}</div>
			<p>{t.showsBefore}<code class="variable">name</code>{t.showsMiddle}<code>bind:value</code>{t.showsAfter}</p>
			<p><code class="selector">greeting</code>{t.classNote}</p>
		</div>
		<div>
			<h3>{t.style}</h3>
			<p class="purpose">{t.stylePurpose}</p>
			<div class="example">{@html markup.stylesheet}</div>
			<p><code class="selector">.greeting</code>{t.selectorMiddle}<code>class="greeting"</code>{t.selectorAfter}</p>
		</div>
	</div>
	<div class="legend"><span class="variable">{t.variableLegend}</span><span class="selector">{t.selectorLegend}</span></div>
	<div class="scope">
		<span>Oxlint</span><strong>{t.oxlint}</strong>
		<span>rsvelte</span><strong>{t.rsvelte}</strong>
	</div>
</figure>

<style>
	.source-figure { border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin: 32px 0; }
	figcaption { padding: 20px 24px; font-size: 15px; font-weight: 600; background: var(--sunken); }
	.source-regions { display: grid; grid-template-columns: 1fr 1.2fr 1fr; }
	.source-regions > div { min-width: 0; padding: 24px 20px; }
	.source-regions > div + div { border-left: 1px solid var(--border); }
	h3 { font-size: 16px; font-weight: 600; }
	p { font-size: 13px; line-height: 1.9; margin-top: 16px; color: var(--fg-2); }
	.purpose { font-size: 12px; margin: 4px 0 16px; color: var(--muted); }
	.example { background: var(--sunken); border: 1px solid var(--border); border-radius: 6px; padding: 16px 12px; min-height: 148px; overflow-x: auto; }
	.example :global(pre) { font-size: 15px; line-height: 1.8; margin: 0; }
	.variable, .example :global(.variable-reference) { background: color-mix(in srgb, var(--c-src) 16%, transparent); box-shadow: inset 0 -2px var(--c-src); }
	.selector, .example :global(.selector-reference) { background: color-mix(in srgb, var(--c-gen) 16%, transparent); box-shadow: inset 0 -2px var(--c-gen); }
	.legend { display: flex; flex-wrap: wrap; gap: 16px; padding: 16px 24px; border-top: 1px solid var(--border); font-size: 12px; }
	.legend span { padding: 4px 8px; }
	.scope { display: grid; grid-template-columns: auto 1fr; gap: 12px 24px; background: var(--sunken); padding: 20px 24px; font-size: 13px; line-height: 1.8; }
	.scope span { color: var(--muted); }
	@media (max-width: 900px) { .source-regions { grid-template-columns: 1fr; } .source-regions > div + div { border-left: 0; border-top: 1px solid var(--border); } .example { min-height: auto; } }
	@media (max-width: 600px) { .scope { grid-template-columns: 1fr; gap: 4px; } .scope strong + span { margin-top: 12px; } }
</style>
