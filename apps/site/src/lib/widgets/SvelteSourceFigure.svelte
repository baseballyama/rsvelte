<script lang="ts">
	let { markup }: { markup: Record<string, string> } = $props();
</script>

<figure class="source-figure">
	<figcaption>テンプレートの変数を、スクリプトの宣言に対応付ける</figcaption>
	<div class="source-regions">
		<div>
			<h3>スクリプト</h3>
			<p class="purpose">変数を宣言する</p>
			<div class="example">{@html markup.script}</div>
			<p><code class="variable">name</code> の宣言。テンプレート内の同名の識別子は、この宣言を参照する。</p>
		</div>
		<div>
			<h3>テンプレート</h3>
			<p class="purpose">変数を参照し、入力値を書き戻す</p>
			<div class="example">{@html markup.template}</div>
			<p><code class="variable">name</code> を表示し、<code>bind:value</code> で入力値を書き戻す。</p>
			<p><code class="selector">greeting</code> はスタイルのセレクターに対応するクラス。</p>
		</div>
		<div>
			<h3>スタイル</h3>
			<p class="purpose">クラスに対応する要素を指定する</p>
			<div class="example">{@html markup.stylesheet}</div>
			<p><code class="selector">.greeting</code> はテンプレートの <code>class="greeting"</code> に対応する。</p>
		</div>
	</div>
	<div class="legend"><span class="variable">青：変数 name の宣言と参照</span><span class="selector">緑：クラス greeting とセレクター</span></div>
	<div class="scope">
		<span>Oxlint</span><strong>スクリプト内のJavaScriptを検査</strong>
		<span>rsvelte</span><strong>テンプレートの変数参照と、スクリプトの宣言を名前解決で対応付ける</strong>
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
