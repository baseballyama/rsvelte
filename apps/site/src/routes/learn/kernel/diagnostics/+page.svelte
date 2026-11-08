<script lang="ts">
	import Term from '#lib/components/Term.svelte';
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

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="コンパイルエラーも、lint の指摘も、型エラーも、同じ Diagnostic で表します。この章では診断の形と、「移植していないものは出力しない」という規約を見ます。"
/>

<div class="prose-learn">
	<H2 id="diagnostic" />
	<p>
		<dfn>Diagnostic</dfn>
		は、重大度、機械が読むためのコード、人が読むためのメッセージ、位置、そして終端を持つかどうかの印だけを持ちます。位置は
		<code>Span</code>（バイト）で、行と列に直すのは、タスクが出力を書くときの一回だけです。
	</p>
</div>

<Code item={data.code.severity} />
<Code item={data.code.diagnostic} />

<div class="prose-learn">
	<p>
		<code>code</code> は <code>Cow&lt;'static, str&gt;</code> です。ほとんどのコードは
		<code>"no-unused-vars"</code>
		のような静的な文字列なので、診断を作るたびに文字列を確保せずに済みます。
	</p>
	<p>
		<code>has_end</code> は、Vue を足したときに加わりました。ESLint
		のルールには、位置を一つだけ報告するものがあります（<code>vue/multi-word-component-names</code>
		の <code>source_location</code> は始まりの一点です）。そうした指摘は <code>without_end</code>
		で作り、書き出すときに終端を <code>null</code>
		と書きます。範囲の長さが 0 の指摘と、終端を持たない指摘は、上流の出力では別のものだからです（573ac584b6）。
	</p>

	<H2 id="unsupported" />
	<p>
		rsvelte
		の移植はまだ途中で、多くの構文に対応していません。そうした構文に出会ったとき、それらしい出力を作ると何が起きるでしょうか。上流と比べる一致率に、「偶然合った」出力が紛れ込みます。そして、どの出力が本当に移植されたコードから出たのかが分からなくなります。
	</p>
	<p>そこでカーネルは、「未対応」を表す専用の型を持っています。</p>
</div>

<Code item={data.code.unsupported} />
<Code item={data.code.unsupportedImpl} />

<div class="prose-learn">
	<p>
		<code>Unsupported</code> は、何に対応していないか（<code>what</code
		>）と、それがどこにあるか（<code>source_location</code>）を持ちます。位置は
		<Term name="SourceLocation" /> なので、特定の構文のせいではない拒否（文書全体のレイアウトが一行に収まらない、など）は
		<code>nowhere</code> で「位置なし」と明示します（<a href="/learn/kernel/source#loc">02</a
		>）。次の Svelte の整形タスクの例では、<code>Unsupported</code>
		を受け取るとファイルを書かずに、その構文を指す診断だけを残します。
	</p>
</div>

<Code item={data.code.format} mark={['Err(u) => out.diagnostics.push', 'u.span(),']} />

<div class="prose-learn">
	<p>
		ベンチマークの「診断あり」の件数が多いのは、ほとんどがこの拒否です。{data.documents.toLocaleString(
			'en-US',
		)} 文書のうち、整形は {data.format.diagnostics.toLocaleString('en-US')} 文書で「未対応」などの診断を出しました<Note
			>数字は 14 実測の章の実行時間のベンチマーク（ビルド {data.benchRev.slice(
				0,
				10,
			)}）の値です。「診断なし」は正しさを意味しません。正しさは上流の出力と比べて別に測っています（<a
				href="/learn/measure#parity">14 正しさの基準値との比較検査</a
			>）。</Note
		>。
	</p>

	<DeepDive title="位置を持たせる理由">
		<p>
			位置がなければ、どの構文が原因かはメッセージの文字列でしか分からず、エディタでその場所を示すこともできません。位置があれば、検証用のソースファイル集で「どの構文が、どこで、何件拒否されたか」を集計できます。どちらも、次に何を移植するかを決める材料です。
		</p>
	</DeepDive>
</div>

<ChapterFooter chapter={c} />
