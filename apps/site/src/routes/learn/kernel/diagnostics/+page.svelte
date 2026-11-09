<script lang="ts">
	import ChapterFooter from '#lib/components/ChapterFooter.svelte';
	import ChapterHeader from '#lib/components/ChapterHeader.svelte';
	import Code from '#lib/components/Code.svelte';
	import DeepDive from '#lib/components/DeepDive.svelte';
	import H2 from '#lib/components/H2.svelte';
	import Note from '#lib/components/Note.svelte';
	import { chapter } from '#lib/site.ts';

	let { data } = $props();
	const c = chapter('diagnostics');
</script>

<svelte:head><title>{c.title} — rsvelte 開発者向けの教材</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="コンパイルエラーも、コード検査の指摘も、型エラーも、同じ Diagnostic で表します。まだ移植していない構文は、それらしい出力を作らずに「未対応」として報告します。"
/>

<div class="prose-learn">
	<H2 id="diagnostic" />
	<p>
		<dfn>Diagnostic</dfn>
		は、重大度、機械が読むコード、人が読むメッセージ、位置、終端の有無を持ちます。位置は
		<code>Span</code
		>（ソース内のバイト範囲）で持ち、タスクが出力を書くときに一度だけ行と列に直します。
	</p>
</div>

<Code item={data.code.severity} />
<Code item={data.code.diagnostic} />

<div class="prose-learn">
	<p>
		<code>code</code> の型は <code>Cow&lt;'static, str&gt;</code> です。ほとんどのコードは
		<code>"no-unused-vars"</code> のような静的な文字列なので、診断を作るたびに文字列を確保せずに済みます。
	</p>
	<p>
		<code>has_end</code> は、終端のない指摘を表します。ESLint は、長さ 0
		の範囲と、終端のない一点の位置を区別して出力します。ESLint
		のルールには一点だけを報告するものがあり、たとえば
		<code>vue/multi-word-component-names</code> は文書の先頭の一点を報告します。こうした指摘は
		<code>without_end</code> で作り、書き出すときに終端を <code>null</code> と書きます。
	</p>

	<H2 id="unsupported" />
	<p>
		rsvelte は、公式ツール（公式の Svelte コンパイラや ESLint など）を Rust
		に移植しています。移植はまだ途中で、多くの構文に対応していません。未対応の構文でそれらしい出力を作ると、公式ツールの出力との一致率に、偶然合った出力が混ざります。すると、どの出力が移植済みのコードから出たのか分からなくなります。そこでカーネルは、未対応を表す専用の型を持ちます。
	</p>
</div>

<Code item={data.code.unsupported} />
<Code item={data.code.unsupportedImpl} />

<div class="prose-learn">
	<p>
		<code>Unsupported</code> は、何に対応していないか（<code>what</code
		>）と、それがどこにあるか（<code>source_location</code>）を持ちます。<code>SourceLocation</code>
		は、ソース内の範囲か「位置なし」（<code>SYNTHETIC</code>）のどちらかを表す型です（<a
			href="/learn/kernel/source#loc">02 章</a
		>）。特定の構文が原因ではない拒否は、<code>nowhere</code>
		で位置なしにします。たとえば整形器は、一行に置くと決めた部分が幅に収まらず、書き方を決められないときにこれを使います。
	</p>
	<p>
		次の Svelte の整形タスクは、<code>Unsupported</code> を受け取るとファイルを書かず、その構文を指す診断だけを残します。
	</p>
</div>

<Code item={data.code.format} mark={['.map_err(|u| {', 'u.span(),']} />

<div class="prose-learn">
	<p>
		実行時間のベンチマークでは、{data.documents.toLocaleString('en-US')} 文書のうち {data.format.diagnostics.toLocaleString(
			'en-US',
		)} 文書で、整形タスクが診断を出しました。この数には「未対応」の拒否も構文解析のエラーも含まれ、内訳は数えていません<Note
			>数字は <a href="/learn/measure">14 章</a>の実行時間のベンチマーク（ビルド {data.benchRev.slice(
				0,
				10,
			)}）の値です。診断が出なくても、出力が正しいとは限りません。正しさは公式ツールの出力と比べて別に測ります（<a
				href="/learn/measure#parity">14 章</a
			>）。</Note
		>。
	</p>

	<DeepDive title="位置を持たせる理由">
		<p>
			位置がないと、原因の構文はメッセージの文字列からしか分からず、エディタでその場所を示すこともできません。検証用のソースファイル集は、公式ツールの出力と比べるための、実在する
			Svelte
			ファイルの集まりです。位置があれば、そこで「どの構文が、どこで、何件拒否されたか」を集計できます。その集計で、次に何を移植するかを決めます。
		</p>
	</DeepDive>
</div>

<ChapterFooter chapter={c} />
