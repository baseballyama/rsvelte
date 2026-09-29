<script lang="ts">
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
	lead="コンパイルエラーも、lint の指摘も、型エラーも、同じ Diagnostic で表します。この章では診断の形と、「移植していないものは出力しない」という規約、そして lint ルールの契約を見ます。"
/>

<div class="prose-learn">
	<H2 id="diagnostic" />
	<p>
		<dfn>Diagnostic</dfn> は、重大度、機械が読むためのコード、人が読むためのメッセージ、位置の四つだけを持ちます。位置は
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
		<code>Unsupported</code> は、何に対応していないか（<code>what</code>）と、それがどこにあるか（<code>loc</code>）を持ちます。位置は
		<code>Loc</code> なので、特定の構文のせいではない拒否（文書全体のレイアウトが一行に収まらない、など）は
		<code>nowhere</code> で「位置なし」と明示します（<a href="/learn/kernel/source#loc">02</a>）。整形タスクは、<code>Unsupported</code>
		を受け取るとファイルを書かずに、その構文を指す診断だけを残します。
	</p>
</div>

<Code item={data.code.format} mark={['Err(u) => out.diagnostics.push', 'u.span(),']} />

<div class="prose-learn">
	<p>
		ベンチマークの「診断あり」の件数が多いのは、ほとんどがこの拒否です。{data.documents.toLocaleString('en-US')} 文書のうち、整形は {data.format.diagnostics.toLocaleString('en-US')} 文書で「未対応」などの診断を出しました<Note
			>数字は 13 実測の章のタスク表から。「診断なし」は正しさを意味しません。正しさは上流の出力と比べて別に測っています。</Note
		>。
	</p>

	<DeepDive title="位置を持たせる理由">
		<p>
			位置がなければ、どの構文が原因かはメッセージの文字列でしか分からず、エディタでその場所を示すこともできません。位置があれば、コーパスで「どの構文が、どこで、何件拒否されたか」を集計できます。どちらも、次に何を移植するかを決める材料です。
		</p>
	</DeepDive>

	<H2 id="rule" />
	<p>
		lint ルールの契約は、カーネルの <code>lint</code> モジュールにあります。ルールはコンテキストの型 <code>C</code>
		について総称的で、<code>C</code> を決めるのは言語の側です。
	</p>
</div>

<Code item={data.code.rule} />

<div class="prose-learn">
	<p>
		Svelte プラグインはコンテキストを二つ持ちます。<code>AstCx</code> は書かれたとおりの構文木と JavaScript
		のスコープ解析を、<code>HirCx</code> は HIR と名前解決を持ちます。ルールは自分の問いに答える層を選び、上流の設定と同じ順に並べます（層については
		<a href="/learn/kernel/layers#lint">05</a>）。
	</p>
</div>

<Code item={data.code.rules} />
<Code item={data.code.noUnused} />

<div class="prose-learn">
	<p>
		<code>no-unused-vars</code> の本体は <code>rsv_js</code> にあります。JavaScript の意味に属するルールなので、別の言語（Vue
		など）からもそのまま使えます。
	</p>

	<H2 id="order" />
	<p>
		<code>Findings</code> は、層ごとのルールの組を順に走らせ、ルールごとに計測のフェーズを開き、最後に指摘を開始位置で並べます。層が一つなら
		<code>lint::run</code> が同じことをします。
	</p>
</div>

<Code item={data.code.run} mark={['metrics::phase(rule.id())', 'assert!(', 'sort_by_key']} />

<div class="prose-learn">
	<p>
		<code>sort_by_key</code> は安定ソートなので、同じ位置の指摘はルールの報告順のまま残ります。ESLint も行、列の順で安定に並べるので、これで上流と同じ順になります。
	</p>
</div>

<LintSort />
<Code item={data.code.orderTest} />

<div class="prose-learn">
	<p>
		<code>assert!</code> は、ルールが自分の ID 以外のコードで報告していないかを確かめます。release
		ビルドでも確かめるので、契約を破ったルールはその場で panic し、<code>run_document</code> がその文書の panic として報告します（<a
			href="/learn/kernel/pipeline#run-document">06</a
		>）。コストはルールが出した指摘の数だけの比較です。
	</p>

	<H2 id="render" />
	<p>
		<code>render_json</code> は指摘を ESLint と同じ形の JSON にします。行は 1 から、列も 1 から、単位は UTF-16 です。<code
			>LineCol::column</code
		>
		は 0 から数えるので、ここで 1 を足します。
	</p>
</div>

<Code item={data.code.render} mark={['lc.column + 1']} />
<Code item={data.code.columnsTest} />

<ChapterFooter chapter={c} />
