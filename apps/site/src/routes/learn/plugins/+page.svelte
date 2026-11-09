<script lang="ts">
	import ChapterFooter from '#lib/components/ChapterFooter.svelte';
	import ChapterHeader from '#lib/components/ChapterHeader.svelte';
	import Code from '#lib/components/Code.svelte';
	import H2 from '#lib/components/H2.svelte';
	import { chapter } from '#lib/site.ts';

	let { data } = $props();
	const currentChapter = chapter('plugins');
</script>

<svelte:head><title>{currentChapter.title} — rsvelte 開発者向けの教材</title></svelte:head>

<ChapterHeader
	chapter={currentChapter}
	lead="独自の計算結果とタスクをカーネルに登録し、文書に対して実行する手順です。例として、既存の Svelte プラグインの構文木から要素の数を数える処理を追加し、実行します。"
/>

<div class="prose-learn">
	<p>
		登録と実行の仕組みは言語によりません。この章の例は Svelte
		の構文解析を使います。ここでいう要素は、タグで書く構文木のノードです。別の言語なら、その言語の構文木と、文書が対象かどうかの判定を使います。
	</p>
	<H2 id="boundary" />
	<p>
		プラグインは、Rust
		の型と処理を登録するライブラリです。登録関数は呼び出し側が呼びます。共有ライブラリを実行時に探して読み込む仕組みはありません。
	</p>
	<table>
		<thead><tr><th>目的</th><th>使う入口</th></tr></thead>
		<tbody>
			<tr
				><td>自分で構文解析して結果を使う</td><td
					><code>rsvelte_svelte_syntax::parse::parse</code></td
				></tr
			>
			<tr
				><td>他のタスクと構文解析結果を共有する</td><td
					><code>context.get::&lt;rsvelte_svelte_syntax::Parsed&gt;()</code></td
				></tr
			>
			<tr
				><td>独自の処理をカーネルから実行する</td><td
					>計算結果の型とタスクを <code>Registry</code> に登録する</td
				></tr
			>
		</tbody>
	</table>
	<p>
		別の Rust ライブラリから使うときは、<code>Cargo.toml</code> の依存関係に
		<code>rsvelte_svelte_syntax</code>
		を追加します。名前解決の結果も使うときは <code>rsvelte_svelte_semantic</code>
		も追加します。カーネルに接続する例では、<code>rsvelte_kernel</code> と
		<code>rsvelte_plugin_interface</code>
		も要ります。このリポジトリ内では workspace の依存設定を使えます。外から使うときは、各 crate のディレクトリを
		<code>path</code> に指定します。crate はまだ公開していません。
	</p>
	<p>
		構文解析は <code>rsvelte_svelte_syntax</code> の <code>parse</code>
		にあります。下の抜粋はその定義です。
	</p>
	<p>
		構文解析関数は <code>Result&lt;Component, Diagnostic&gt;</code> を返します。<code
			>Component</code
		>
		はこのプロジェクト独自の構文木で、テンプレート、JavaScript、スタイル、トークンを持ちます。名前や本文はソース内の位置で参照するので、元のソースも残してください。未対応の構文はエラーになります。
	</p>
</div>

<Code item={data.code.parse} />

<div class="prose-learn">
	<H2 id="parsed" />
	<p>
		カーネルで共有する値は、<code>Artifact</code> を実装して定義します。<code>Parsed</code>
		は結果そのものではなく、保存先を表す型です。<code>Output</code> が保存する値の型、<code
			>compute</code
		>
		がそれを計算する処理です。<code>NAME</code> は計測にも使う名前です。
	</p>
</div>

<Code item={data.code.parsed} />

<div class="prose-learn">
	<p>
		登録しただけでは、構文解析は走りません。最初の <code>get::&lt;Parsed&gt;()</code>
		が計算し、同じ実行の同じ文書では保存した結果を返します。エラーも保存します。返り値は参照なので、タスクは構文木を借りて読みます。
	</p>
	<p>
		共有の範囲は一つの <code>DocumentContext</code>
		です。結果は、別の文書や次の実行には残りません。保存の仕組みは
		<a href="/learn/kernel/database">04 章「計算結果の保存と再利用」</a>で説明しています。
	</p>
	<H2 id="artifact" />
	<p>
		ここからは実行できる例です。テンプレートにある要素の数を、入れ子の要素も含めて数える <code
			>ElementCount</code
		>
		を作ります。構文解析の結果には、Svelte の <code>Parsed</code> を使います。
	</p>
</div>

<Code item={data.code.count} mark={['context.get::<Parsed>()']} />

<div class="prose-learn">
	<p>
		<code>compute</code>
		の中で別の計算結果を取得すると、それが依存関係になります。この例が依存するのは構文解析だけなので、ほかの解析は走りません。
	</p>
	<p>
		構文解析に失敗したときは <code>None</code> を返します。元の診断は <code>Parsed</code>
		に残り、タスクが報告します。こうして、要素がないときの <code>Some(0)</code> と、計算できなかったときを区別します。
	</p>
	<H2 id="task" />
	<p>
		文書ごとに実行する処理は、<code>Task</code>
		を実装して作ります。タスクは必要な計算結果を取得し、出力を <code>TaskOutput</code> に書きます。
	</p>
</div>

<Code item={data.code.task} />

<div class="prose-learn">
	<ul>
		<li><code>identifier</code> はタスクの識別名で、実行するタスクを選ぶときに使います。</li>
		<li>
			<code>applies</code> は、文書が処理の対象かを判定します。この例は Svelte の拡張子判定を使います。
		</li>
		<li><code>run</code> は、構文解析の診断を報告するか、要素数を出力します。</li>
	</ul>
	<p>
		<code>run</code> は構文解析の成否を確かめた後、要素数の計算でも <code>Parsed</code>
		を取得します。同じ文書なら保存した値を読むので、構文解析は二度起きません。診断を出すかどうかはタスクが決めます。
	</p>
	<p>
		<code>out.file</code>
		はファイル名とテキストを結果に加えます。ディスクには書きません。保存や表示は呼び出し側の役目です。
	</p>
	<H2 id="register" />
	<p>
		登録関数は、プラグインが用意する普通の Rust 関数です。プラグインの名前・版・依存先を <code
			>Plugin</code
		>
		として宣言し、<code>Registry::plugin</code>
		で登録します。<code>run</code> と <code>run_each</code>（結果ができた文書から順に返す
		<code>run</code>）は、実行の前に依存先の不足、版の不一致、循環を確かめます。
	</p>
</div>

<Code item={data.code.plugin} />

<div class="prose-learn">
	<p>
		この例は、宣言の後に Svelte
		の中核部分を登録し、自分の計算結果とタスクを一つずつ登録します。依存する型をカーネルが自動で登録することはありません。
	</p>
</div>

<Code item={data.code.register} />

<div class="prose-learn">
	<p>
		この登録には、Svelte
		のコンパイルや型検査のタスクは含まれません。標準のツールも使うときは、同じ登録先に各ツールの登録関数を呼びます。整形なら
		<code>rsvelte_svelte_format::register</code>
		です。言語の中核部分の登録関数は、プラグインの宣言、パーサ、共有する解析結果を登録します。
	</p>
</div>

<Code item={data.code.svelteRegister} />

<div class="prose-learn">
	<p>
		同じ計算結果の型をもう一度登録しても、保存先は増えません。別の型に同じ計算名を付けたり、同じタスク識別名を二度登録したりするとエラーになります。登録は実行の前に済ませてください。
	</p>
	<H2 id="host" />
	<p>
		呼び出し側には、プラグインを <code>Extension</code> として渡します。<code>install</code>
		はプラグインのオプションを読み、登録関数を呼びます。
	</p>
</div>

<Code item={data.code.extension} />

<div class="prose-learn">
	<p>
		呼び出し側は、実行するタスクとオプションを <code>Settings</code> に入れ、<code
			>rsvelte_plugin_interface::install</code
		>
		で登録先を作ります。その後、文書と実行設定を渡します。この例は、<code>Selection::Named</code>
		で追加したタスクだけを選びます。<code>NoFunctions</code>
		は、設定ファイルから呼ぶ関数がないことを表します。
	</p>
</div>

<Code item={data.code.host} />

<div class="prose-learn">
	<p>次のコマンドで例を実行すると、<code>elements.txt: 2</code> と表示されます。</p>
	<pre><code>cargo run -p rsvelte_example_plugin --example host</code></pre>
	<p>
		<code>Sharing::Shared</code> は、同じ文書のタスクどうしで計算結果を共有します。<code
			>Sharing::Isolated</code
		>
		は共有しない設定で、比較の計測に使います。文書は並列に処理し、一つの文書のタスクは順に実行します。
	</p>
	<p>
		<code>tasks</code>
		が空なら、登録済みの全タスクを選びます。未知の識別名があると、実行前にエラーを返します。通常の診断は、各タスクの出力に入ります。タスクが異常終了したときは
		<code>DocumentResult.panic</code> に入ります。呼び出し側は両方を確かめてください。
	</p>
	<H2 id="extension" />
	<p>
		新しい言語を追加するときは、文書が対象かどうかの判定、構文解析の結果の型、タスク、登録関数を用意します。Svelte
		の登録関数 <code>rsvelte_svelte_semantic::register</code> は、構文解析に続けて
		<code>Resolved</code>
		なども登録します。次の抜粋は <code>Resolved</code>
		の定義です。この章の例もこの関数を呼ぶので、<code>context.get::&lt;Resolved&gt;()</code>
		で名前解決の結果を使えます。
	</p>
</div>

<Code item={data.code.resolved} />

<div class="prose-learn">
	<p>
		言語ごとに答えが違う問いには、共通の呼び出し窓口 <code>Facet</code>
		を使います。窓口に答える提供元は <code>Registry::provide</code>
		で登録します。たとえば型検査は、どの言語の文書にも型検査用の TypeScript を求めます。Svelte は、そのコードを返す
		<code>TypeScriptView</code> の提供元を登録しています。
	</p>
</div>

<Code item={data.code.svelteTasks} />

<div class="prose-learn">
	<p>
		複数の文書の結果をまとめる処理には、<code>FinishTask</code> を使います。文書ごとの
		<code>prepare</code>
		が所有権を持つデータを返し、全体の <code>finish</code>
		がそれをまとめて処理します。文書の実行環境から借りた参照は、<code>finish</code> まで持ち越せません。
	</p>
	<p>
		共通の呼び出し窓口は <a href="/learn/kernel/database#facet">04 章</a>、複数の文書の実行は
		<a href="/learn/kernel/pipeline#tasks">06 章</a>で説明しています。実際の登録を試すなら、<a
			href="/learn/playground">パイプラインのプレイグラウンド</a
		>も使えます。
	</p>
</div>

<ChapterFooter chapter={currentChapter} />
