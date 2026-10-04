<script lang="ts">
	import Term from '$lib/components/Term.svelte';
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import DeepDive from '$lib/components/DeepDive.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import LintSort from '$lib/widgets/LintSort.svelte';

	let { data } = $props();
	const c = chapter('diagnostics');
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="コンパイルエラーも、lint の指摘も、型エラーも、同じ Diagnostic で表します。この章では診断の形と、「移植していないものは出力しない」という規約、そして lint ルールの守るべき条件を見ます。"
/>

<div class="prose-learn">
	<H2 id="diagnostic" />
	<p>
		<dfn>Diagnostic</dfn> は、重大度、機械が読むためのコード、人が読むためのメッセージ、位置、そして終端を持つかどうかの印だけを持ちます。位置は
		<code>Span</code>（バイト）で、行と列に直すのは、タスクが出力を書くときの一回だけです。
	</p>
</div>

<Code item={data.code.severity} />
<Code item={data.code.diagnostic} />

<div class="prose-learn">
	<p>
		<code>code</code> は <code>Cow&lt;'static, str&gt;</code> です。ほとんどのコードは <code>"no-unused-vars"</code>
		のような静的な文字列なので、診断を作るたびに文字列を確保せずに済みます。
	</p>
	<p>
		<code>has_end</code> は、Vue を足したときに加わりました。ESLint のルールには、位置を一つだけ報告するものがあります（<code
			>vue/multi-word-component-names</code
		>
		の <code>source_location</code> は始まりの一点です）。そうした指摘は <code>without_end</code> で作り、書き出すときに終端を <code>null</code>
		と書きます。範囲の長さが 0 の指摘と、終端を持たない指摘は、上流の出力では別のものだからです（573ac584b6）。
	</p>

	<H2 id="unsupported" />
	<p>
		rsvelte の移植はまだ途中で、多くの構文に対応していません。そうした構文に出会ったとき、それらしい出力を作ると何が起きるでしょうか。上流と比べる一致率に、「偶然合った」出力が紛れ込みます。そして、どの出力が本当に移植されたコードから出たのかが分からなくなります。
	</p>
	<p>そこでカーネルは、「未対応」を表す専用の型を持っています。</p>
</div>

<Code item={data.code.unsupported} />
<Code item={data.code.unsupportedImpl} />

<div class="prose-learn">
	<p>
		<code>Unsupported</code> は、何に対応していないか（<code>what</code>）と、それがどこにあるか（<code>source_location</code>）を持ちます。位置は
		<Term name="SourceLocation" /> なので、特定の構文のせいではない拒否（文書全体のレイアウトが一行に収まらない、など）は
		<code>nowhere</code> で「位置なし」と明示します（<a href="/learn/kernel/source#loc">02</a>）。次の Svelte の整形タスクの例では、<code>Unsupported</code>
		を受け取るとファイルを書かずに、その構文を指す診断だけを残します。
	</p>
</div>

<Code item={data.code.format} mark={['Err(u) => out.diagnostics.push', 'u.span(),']} />

<div class="prose-learn">
	<p>
		ベンチマークの「診断あり」の件数が多いのは、ほとんどがこの拒否です。{data.documents.toLocaleString('en-US')} 文書のうち、整形は {data.format.diagnostics.toLocaleString('en-US')} 文書で「未対応」などの診断を出しました<Note
			>数字は 13 実測の章の実行時間のベンチマーク（ビルド {data.benchRev.slice(0, 10)}）の値です。「診断なし」は正しさを意味しません。正しさは上流の出力と比べて別に測っています（<a
				href="/learn/measure#parity">13 正しさの基準値との比較検査</a
			>）。</Note
		>。
	</p>

	<DeepDive title="位置を持たせる理由">
		<p>
			位置がなければ、どの構文が原因かはメッセージの文字列でしか分からず、エディタでその場所を示すこともできません。位置があれば、検証用のソースファイル集で「どの構文が、どこで、何件拒否されたか」を集計できます。どちらも、次に何を移植するかを決める材料です。
		</p>
	</DeepDive>

	<H2 id="rule" />
	<p>
		lint ルールの守るべき条件は、各言語で共有する <code>rsvelte_lint</code> にあります。カーネルはタスクを実行し、成果物と診断を受け取ります。ルールはコンテキストの型 <code>C</code>
		について総称的で、<code>C</code> を決めるのは言語の側です。
	</p>
</div>

<Code item={data.code.rule} />

<div class="prose-learn">
	<p>
		Svelte プラグインのコンテキストは、文書の計算結果を持つ <code>DocumentContext</code> 一つです。設定の中の各ルール（<code>RuleConfiguration</code>）が
		<code>Rule&lt;DocumentContext&gt;</code> を実装します。各ルールは、自分の問いに答える層（元の構文木、名前解決、コンパイル用に整理した構文木）をその場で求めます。ルールは設定の順に走ります（層については
		<a href="/learn/kernel/layers#lint">05</a>）。
	</p>
</div>

<Code item={data.code.rules} />
<Code item={data.code.ruleImpl} />
<Code item={data.code.noUnused} mark={['rsvelte_typescript_lint::no_unused_variables(&facts, identifier, |_| true, out)']} />

<div class="prose-learn">
	<p>
		<code>no-unused-variables</code> の本体は <code>rsvelte_typescript_lint</code> にあります。JavaScript の意味に属するルールなので、Vue
		プラグインもそのまま使っています。違うのは、どの束縛を判定するかをホストが渡すことだけです。Vue では <code>v-for</code>
		の変数を中核のルールには判定させず、<code>vue/no-unused-variables</code> が判定します。逆にすると、比較元の公式ツールとの比較で <code>lint-cases</code> が赤になります（73e09d6167）。二つのプラグインで同じ判断を共有する別の例は
		<a href="/learn/kernel/layers#shared-lint">05</a> にあります。
	</p>

	<H2 id="order" />
	<p>
		<code>Findings</code> は、層ごとのルールの組を順に走らせ、ルールごとに計測のフェーズを開き、最後に指摘を開始位置で並べます。層が一つなら
		<code>rsvelte_lint::rules::run</code> が同じことをします。
	</p>
</div>

<Code item={data.code.run} mark={['measurement::phase(rule.identifier())', 'assert!(', 'sort_by_key']} />

<div class="prose-learn">
	<p>
		<code>sort_by_key</code> は安定ソートなので、同じ位置の指摘はルールの報告順のまま残ります。ESLint も行、列の順で安定に並べるので、これで上流と同じ順になります。
	</p>
</div>

<LintSort />
<Code item={data.code.orderTest} />

<div class="prose-learn">
	<p>
		<code>assert!</code> は、ルールが自分の識別番号以外のコードで報告していないかを確かめます。release
		ビルドでも確かめるので、守るべき条件を破ったルールはその場で panic し、<code>run_document</code> がその文書の panic として報告します（<a
			href="/learn/kernel/pipeline#run-document">06</a
		>）。コストはルールが出した指摘の数だけの比較です。
	</p>

	<H2 id="render" />
	<p>
		<code>render_json_with_rules</code> は指摘を ESLint と同じ形の 構造化データ形式にします（<code>render_json</code> もこれを呼びます）。行は 1 から、列も 1 から、単位は ユニコードの16ビット符号化方式 です。<code
			>LineColumn::column</code
		>
		は 0 から数えるので、ここで 1 を足します。終端を持たない指摘では、<code>end</code> を <code>null</code> と書きます。
	</p>
</div>

<Code item={data.code.render} mark={['lc.column + 1', 'if key == "end" && !d.has_end {']} />
<Code item={data.code.columnsTest} />

<ChapterFooter chapter={c} />
