<script lang="ts">
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import H2 from '$lib/components/H2.svelte';
	import { chapter } from '$lib/site';

	let { data } = $props();
	const currentChapter = chapter('plugins', 'ja');
</script>

<svelte:head><title>{currentChapter.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={currentChapter}
	lead="独自の計算結果とタスクをカーネルに登録し、文書に対して実行する手順を説明します。実行できる例として、既存の言語プラグインの構文木から要素数を数える処理を追加します。"
/>

<div class="prose-learn">
	<p>登録と実行の仕組みは言語に依存しません。この章の例では Svelte の構文解析を利用します。ここでいう要素は、タグで表す構文木のノードです。別の言語を扱う場合は、その言語の構文木と対象文書の判定を使います。</p>
	<H2 id="boundary" />
	<p>プラグインは、Rust の型と処理を登録するライブラリです。呼び出し側が登録関数を呼びます。現在の実装に、共有ライブラリを実行時に探して読み込む仕組みはありません。</p>
	<table>
		<thead><tr><th>目的</th><th>使う入口</th></tr></thead>
		<tbody>
			<tr><td>自分で構文解析して結果を使う</td><td><code>rsvelte_svelte::syntax::parse::parse</code></td></tr>
			<tr><td>他のタスクと構文解析結果を共有する</td><td><code>context.get::&lt;rsvelte_svelte::Parsed&gt;()</code></td></tr>
			<tr><td>独自の処理をカーネルから実行する</td><td>計算結果の型とタスクを <code>Registry</code> に登録する</td></tr>
		</tbody>
	</table>
	<p>別の Rust ライブラリから使う場合は、<code>Cargo.toml</code> の依存関係に <code>rsvelte_svelte</code> を追加します。カーネルに接続する例では <code>rsvelte_kernel</code> も必要です。このリポジトリ内では workspace の依存設定を使えます。外から参照する場合は、各 crate のディレクトリを <code>path</code> に指定します。現在は公開パッケージの設定になっていません。</p>
	<p>構文解析関数は <code>Result&lt;Component, Diagnostic&gt;</code> を返します。結果はこのプロジェクト独自の構文木です。テンプレート、JavaScript、スタイル、トークンを保持します。名前や本文はソース内の位置で参照するため、元のソースも保持してください。未対応の構文はエラーになります。</p>
</div>

<Code item={data.code.parse} />

<div class="prose-learn">
	<H2 id="parsed" />
	<p>カーネルで共有する値には、計算結果を定義する <code>Artifact</code> を実装します。<code>Parsed</code> は結果そのものではなく、保存先を識別する型です。<code>Output</code> が保存する値の型、<code>compute</code> が計算する処理です。<code>NAME</code> は計測にも使う名前です。</p>
</div>

<Code item={data.code.parsed} />

<div class="prose-learn">
	<p>登録だけでは構文解析は走りません。最初の <code>get::&lt;Parsed&gt;()</code> が計算し、同じ文書の同じ実行環境では保存済みの結果を返します。エラーも保存します。返り値は参照なので、タスクは構文木を借りて読みます。</p>
	<p>共有する範囲は一つの <code>DocumentContext</code> です。別の文書や次の実行まで結果を保持する仕組みではありません。詳しい保存の処理は <a href="/learn/kernel/database">04 計算結果の保存と再利用</a>で説明しています。</p>
	<H2 id="artifact" />
	<p>ここからは実行できる追加例です。テンプレートに記録された要素の数を求める <code>ElementCount</code> を作ります。構文解析の結果は Svelte の <code>Parsed</code> を使います。</p>
</div>

<Code item={data.code.count} mark={['context.get::<Parsed>()']} />

<div class="prose-learn">
	<p><code>compute</code> の中で別の計算結果を取得することで、必要な依存関係を表します。この例は構文解析だけを必要とします。名前解決やコード生成は呼びません。登録済みの結果を先にすべて計算する必要もありません。</p>
	<p>構文解析に失敗した場合は <code>None</code> を返します。元の診断は <code>Parsed</code> に残り、タスクが報告します。要素がない場合の <code>Some(0)</code> と、計算できなかった場合を区別します。</p>
	<H2 id="task" />
	<p>文書ごとに実行する処理には <code>Task</code> を実装します。タスクは必要な計算結果を取得し、出力を <code>TaskOutput</code> に渡します。</p>
</div>

<Code item={data.code.task} />

<div class="prose-learn">
	<ul>
		<li><code>identifier</code> はタスクの識別名です。実行時の選択に使います。</li>
		<li><code>applies</code> は処理対象の判定です。この例は Svelte の拡張子判定を使います。</li>
		<li><code>run</code> は構文解析の診断を報告するか、要素数を出力します。</li>
	</ul>
	<p>構文解析を確認したあと、要素数の計算でも <code>Parsed</code> を取得します。同じ文書では保存済みの値を読むため、ここで二度目の構文解析は起きません。診断を出すかどうかはタスク側で決めます。計算結果を取得しただけでは診断は出力されません。</p>
	<p><code>output.file</code> はファイル名とテキストを結果に追加します。ディスクへの書き込みはしません。保存や表示は呼び出し側の仕事です。</p>
	<H2 id="register" />
	<p>登録関数はプラグイン側で用意する普通の Rust 関数です。今回の例では、使う二つの計算結果と一つのタスクを登録します。カーネルは依存する型を自動登録しません。</p>
	<p>
		配布する登録関数は、さらに名前・版・依存先を <code>Plugin</code> として宣言し、<code>Registry::plugin</code> で登録します。<code>run</code> と <code>run_each</code>
		は実行の前に、依存先の不足、版の不一致、循環を確かめます。この例は宣言を省いています。
	</p>
</div>

<Code item={data.code.register} />

<div class="prose-learn">
	<p>この登録なら、Svelte のコンパイルや型検査のタスクは入りません。標準のツールも使う場合は、同じ登録先に各ツールの登録関数を呼びます。整形なら <code>rsvelte_svelte_format::register</code> です。言語の中核部分の登録は、プラグインの宣言、パーサの登録、共有する解析結果の登録をします。</p>
</div>

<Code item={data.code.svelteRegister} />

<div class="prose-learn">
	<p>同じ計算結果の型を再度登録しても保存先は増えません。別の型に同じ計算名を使うことや、同じタスク識別名を二度登録することはエラーになります。登録は実行前に済ませてください。</p>
	<H2 id="host" />
	<p>呼び出し側は登録先を作り、文書と実行設定を渡します。この例は追加したタスクだけを選びます。</p>
</div>

<Code item={data.code.host} />

<div class="prose-learn">
	<p>次のコマンドで例を実行すると、<code>elements.txt: 2</code> と表示します。</p>
	<pre><code>cargo run -p rsvelte_command_line --example plugin</code></pre>
	<p><code>Sharing::Shared</code> は同じ文書のタスク間で計算結果を共有します。<code>Sharing::Isolated</code> は共有しない場合の比較計測に使います。文書は並列に処理し、一つの文書内のタスクは順に実行します。</p>
	<p><code>tasks</code> が空なら登録済みの全タスクを選びます。未知の識別名は実行前にエラーになります。通常の診断は各タスクの出力に入り、タスクの異常終了は <code>DocumentResult.panic</code> に入ります。呼び出し側は両方を確認します。</p>
	<H2 id="extension" />
	<p>新しい言語を追加する場合も、対象文書の判定、構文解析結果の型、タスク、登録関数を用意します。Svelte の結果を利用する今回の例では、構文解析は既存の <code>Parsed</code> に任せます。Svelte の名前解決も使う場合は、その型も登録します。</p>
</div>

<Code item={data.code.resolved} />

<div class="prose-learn">
	<p>複数の言語が同じ処理に答える場合は、共通の質問を定義する <code>Facet</code> と、提供元を登録する <code>Registry::provide</code> を使います。Svelte は型検査用のコードを返す <code>TypeScriptView</code> の提供元を登録しています。</p>
</div>

<Code item={data.code.svelteTasks} />

<div class="prose-learn">
	<p>他の文書も必要な処理には <code>FinishTask</code> を使います。文書ごとの <code>prepare</code> で所有権を持つデータを返し、全体の <code>finish</code> でまとめて処理します。文書の実行環境から借りた参照は、この段階まで持ち越せません。</p>
	<p>保存の仕組みは <a href="/learn/kernel/database#facet">04 共通の呼び出し窓口</a>、複数文書の実行は <a href="/learn/kernel/pipeline#tasks">06 処理の登録と並列実行</a>で説明しています。実際の登録を試す場合は、<a href="/learn/playground">パイプラインのプレイグラウンド</a>も使えます。</p>
</div>

<ChapterFooter chapter={currentChapter} />
