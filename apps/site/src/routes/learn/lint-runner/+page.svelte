<script lang="ts">
	import ChapterFooter from '#lib/components/ChapterFooter.svelte';
	import ChapterHeader from '#lib/components/ChapterHeader.svelte';
	import Code from '#lib/components/Code.svelte';
	import H2 from '#lib/components/H2.svelte';
	import { chapter } from '#lib/site.ts';
	import LintSort from '#lib/widgets/LintSort.svelte';

	let { data } = $props();
	const c = chapter('lint-runner');
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="どの言語の lint も、ルールの走らせ方と指摘の並び順、ESLint の形での書き出しを rsvelte_lint_runner で共有します。この crate は言語を知らず、カーネルの診断だけを使います。"
/>

<div class="prose-learn">
	<H2 id="rule" />
	<p>
		lint ルールの守るべき条件は、各言語で共有する <code>rsvelte_lint_runner</code>
		にあります。カーネルはタスクを実行し、成果物と診断を受け取ります。ルールはコンテキストの型
		<code>C</code>
		について総称的で、<code>C</code> を決めるのは言語の側です。
	</p>
</div>

<Code item={data.code.rule} />

<div class="prose-learn">
	<p>
		ルールは指摘を <code>Reporter</code>
		に渡します。<code>Reporter</code> はルールの識別名と重大度を各指摘に付けるので、ルールは別のルールの名前で報告できません。ルールが渡すのはメッセージと位置だけです。
	</p>
</div>

<Code item={data.code.reporter} />

<div class="prose-learn">
	<p>
		Svelte プラグインのコンテキストは、文書の計算結果を持つ <code>DocumentContext</code>
		一つです。設定の中の各ルール（<code>RuleConfiguration</code>）が
		<code>Rule&lt;DocumentContext&gt;</code>
		を実装します。各ルールは、自分の問いに答える層（元の構文木、名前解決、コンパイル用に整理した構文木）をその場で求めます。ルールは設定の順に走ります（層については
		<a href="/learn/kernel/layers#lint">05</a>）。
	</p>
</div>

<Code item={data.code.rules} />
<Code item={data.code.ruleImpl} />
<Code
	item={data.code.noUnused}
	mark={['rsvelte_typescript_lint::no_unused_variables(&facts, |_| true, reporter)']}
/>

<div class="prose-learn">
	<p>
		<code>no-unused-vars</code> の本体は <code>rsvelte_typescript_lint</code> にあります。JavaScript
		の意味に属するルールなので、Vue
		プラグインもそのまま使っています。違うのは、どの束縛を判定するかをホストが渡すことだけです。Vue
		では <code>v-for</code>
		の変数を中核のルールには判定させず、<code>vue/no-unused-vars</code>
		が判定します。逆にすると、比較元の公式ツールとの比較で <code>lint-cases</code>
		が赤になります（73e09d6167）。二つのプラグインで同じ判断を共有する別の例は
		<a href="/learn/kernel/layers#shared-lint">05</a> にあります。
	</p>

	<H2 id="order" />
	<p>
		<code>Findings</code>
		は、層ごとのルールの組を順に走らせ、ルールごとに計測のフェーズを開き、最後に指摘を開始位置で並べます。ルールの組は、Svelte
		の設定のような値の列でも、Vue のような <code>dyn Rule</code> の列でも渡せます。
	</p>
</div>

<Code
	item={data.code.run}
	mark={[
		'measurement::phase(rule.identifier())',
		'Reporter::new(rule, &mut self.out)',
		'sort_by_key',
	]}
/>

<div class="prose-learn">
	<p>
		<code>sort_by_key</code> は安定ソートなので、同じ位置の指摘はルールの報告順のまま残ります。ESLint
		も行、列の順で安定に並べるので、これで上流と同じ順になります。
	</p>
</div>

<LintSort />
<Code item={data.code.orderTest} />

<div class="prose-learn">
	<H2 id="render" />
	<p>
		<code>render_json</code> は指摘を ESLint と同じ形の
		構造化データ形式にします。ルール名は反復子で受け取るので、呼び出し側は名前の配列を作りません。出力の長さは先に見積もり、文字列の確保を一度で済ませます。行は
		1 から、列も 1 から、単位は ユニコードの16ビット符号化方式 です。<code>LineColumn::column</code>
		は 0 から数えるので、<code>position</code> で 1 を足します。終端を持たない指摘では、<code
			>end</code
		>
		を
		<code>null</code> と書きます。
	</p>
</div>

<Code item={data.code.render} mark={['capacity(rules.clone(), findings)', 'if d.has_end {']} />
<Code item={data.code.position} mark={['at.column + 1']} />
<Code item={data.code.columnsTest} />

<ChapterFooter chapter={c} />
