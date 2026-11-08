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

<svelte:head><title>{c.title} — rsvelte 開発者向けの教材</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="どの言語のコード検査も、ルールの走らせ方、指摘の並び順、ESLint の形での書き出しを rsvelte_lint_runner で共有します。この crate は言語を知らず、カーネルの診断と計測だけを使います。"
/>

<div class="prose-learn">
	<H2 id="rule" />
	<p>
		コード検査のルールが実装するトレイト <code>Rule</code> は、各言語で共有する
		<code>rsvelte_lint_runner</code> にあります。ルールはコンテキスト <code>C</code>
		を受け取り、見つけた指摘を <code>Reporter</code> に渡します。<code>C</code> の型は言語の側が決めます。
	</p>
</div>

<Code item={data.code.rule} />

<div class="prose-learn">
	<p>
		<code>Reporter</code>
		は、ルールの識別名と重大度を各指摘に付けます。そのため、ルールは別のルールの名前で報告できません。ルールが渡すのはメッセージと位置だけです。
	</p>
</div>

<Code item={data.code.reporter} />

<div class="prose-learn">
	<p>
		Svelte プラグインのコンテキストは、文書の計算結果を持つ <code>DocumentContext</code>
		一つです。設定は enum <code>RuleConfiguration</code> の値の並びです。その各値が、そのまま
		<code>Rule&lt;DocumentContext&gt;</code>
		を実装したルールです。各ルールは、自分の問いに答える層をその場で求めます。層は元の構文木、名前解決、コンパイル用に整理した構文木です（<a
			href="/learn/kernel/layers#lint">05 章</a
		>）。ルールは設定の順に走り、出した指摘には設定の重大度（<code>severity</code>）を付けます。
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
		プラグインもそのまま使っています。違うのは、どの束縛を判定するかを呼び出す側が関数で渡すことだけです。Vue
		では <code>v-for</code>
		の変数を、共通の <code>no-unused-vars</code> でなく <code>vue/no-unused-vars</code>
		が判定します。<code>v-for</code> の変数も共通のルールに判定させると、テスト
		<code>lint-cases</code>
		が失敗します。<code>lint-cases</code> は、rsvelte のコード検査を公式ツール（ESLint
		とそのプラグイン）と比べるテストです。二つのプラグインで同じ判断を共有する別の例は
		<a href="/learn/kernel/layers#shared-lint">05 章</a>にあります。
	</p>

	<H2 id="order" />
	<p>
		一つの文書の指摘を集める型 <code>Findings</code>
		は、層ごとのルールの組を順に走らせます。ルールごとに計測のフェーズを開き、最後に指摘を開始位置で並べます。ルールの組は、Svelte
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
		も行、列の順で安定に並べるので、これで公式ツールと同じ順になります。
	</p>
</div>

<LintSort />
<Code item={data.code.orderTest} />

<div class="prose-learn">
	<H2 id="render" />
	<p>
		<code>render_json</code> は、指摘を ESLint と同じ形の JSON にします。<code>rules</code>
		には走らせたルールの名前を反復子で渡すので、呼び出し側は名前の配列を作りません。出力の長さは先に見積もり、文字列の確保を一度で済ませます。行も列も
		1 から数え、列の単位は UTF-16 です。<code>LineColumn</code>
		の行はもともと 1 始まりですが、列は 0 始まりなので、<code>position</code> で 1
		を足します。終端を持たない指摘では、<code>end</code>
		を <code>null</code> と書きます。
	</p>
</div>

<Code item={data.code.render} mark={['capacity(rules.clone(), findings)', 'if d.has_end {']} />
<Code item={data.code.position} mark={['at.column + 1']} />
<Code item={data.code.columnsTest} />

<ChapterFooter chapter={c} />
