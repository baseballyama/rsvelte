<svelte:head>
	<title>仕組み ・ rsvelte</title>
</svelte:head>

<h1>仕組み</h1>

<p>
	rsvelte の開発に参加する人向けの概要です。rsvelte は 1
	回の実行の中で各ファイルを一度だけ解析し、その結果をタスクの間で共有します。
</p>

<h2 id="flow">一度読んで共有する</h2>

<ol>
	<li>
		パーサーがソースを読み、構文木を作ります。構文木は作ったあと変更しません。例外は、oxc
		の意味解析がスコープや変数の番号を書き込むことだけです。
	</li>
	<li>
		意味解析は、変数のスコープなどの事実を構文木とは別の表に記録します。構文木と表は、ファイルごとのデータベースに保存されます。
	</li>
	<li>
		タスクは、ファイルに対する 1 つの処理です（Svelte のコード検査なら <code
			>svelte.lint/default</code
		>）。タスクは必要な計算結果だけをデータベースに求めます。まだない結果はその場で計算され、同じファイルのほかのタスクと共有されます。
	</li>
	<li>
		ファイルは 1 スレッドに 1
		つずつ割り当てられ、並列に処理されます。型検査のタスクは、全ファイルのあとにプロジェクト全体を 1
		回検査します。
	</li>
</ol>

<h2 id="crates">クレートの構成</h2>

<table>
	<thead>
		<tr><th>ディレクトリ</th><th>役割</th></tr>
	</thead>
	<tbody>
		<tr>
			<td><code>crates/language_independent/</code></td>
			<td>
				どの言語も知らない部分。文書、位置、診断、計算結果のデータベース、タスクのスケジューラ（<code
					>kernel</code
				>）と、プラグインの接続口（<code>plugin_interface</code
				>）。コード検査と整形の共通部品、テストの仕組みもここにあります
			</td>
		</tr>
		<tr>
			<td><code>crates/languages/&lt;言語&gt;/</code></td>
			<td>
				言語ごとの構文解析と意味解析、各ツール（<code>compile</code>、<code>lint</code>、<code
					>format</code
				>、<code>check</code>）
			</td>
		</tr>
		<tr>
			<td><code>crates/bridges/</code></td>
			<td
				>Vue のコンポーネントを Svelte
				のランタイム向けにコンパイルするなど、フレームワークをまたぐコンパイル</td
			>
		</tr>
		<tr>
			<td><code>crates/hosts/</code></td>
			<td>
				プラグインを組み合わせて動かすプログラム。<code>rsvelte</code> コマンド（<code
					>command_line</code
				>）と WebAssembly 版（<code>browser</code>）
			</td>
		</tr>
	</tbody>
</table>

<p>
	各ツールは、自分のタスク（<code>svelte.compile/client</code>
	など）を登録するクレートです。JavaScript と TypeScript の解析には
	<a href="https://oxc.rs/">oxc</a>
	を使います。<code>rsvelte format</code>
	だけはタスクを使わず、oxfmt のファイル処理から Svelte の整形を呼び出します。
</p>

<h2 id="typecheck">型検査</h2>

<p>
	<code>typecheck</code> は Svelte コンポーネントを TypeScript
	のコードに変換し、元の位置との対応表を付けて型検査器へ渡します。型検査器は、この対応表でエラーの位置を元の
	Svelte ファイルの位置に戻します。変換は
	<code>crates/languages/svelte/typescript_projection</code> にあります。
</p>

<h2 id="correctness">公式ツールとの比較</h2>

<p>
	<code>corpus/</code> には、MIT などの緩いライセンスで公開された実在の Svelte 5 ファイルと、このプロジェクト用に書いたファイルがあります。正解の出力は、svelte
	や svelte-check などの公式ツールで作ります。
</p>

<p>
	<code>cargo test</code> は rsvelte
	の出力を正解と比べます。一致したかどうかの判定は、タスクごとに台帳（<code
		>corpus/_registry/parity/</code
	>）に記録されています。判定が台帳と変わると、テストが失敗します。意図した変化は
	<code>UPDATE_EXPECT=1</code> で記録し直します。
</p>

<h2 id="contribute">開発に参加する</h2>

<pre><code
		>{`cargo test                                        # Rust のテスト
cargo test -p rsvelte_command_line --test corpus  # 公式ツールとの比較
pnpm install && pnpm run check                    # TypeScript 側の検査`}</code
	></pre>

<p>
	開発のルールは <a href="https://github.com/baseballyama/rsvelte/blob/main/AGENTS.md"
		><code>AGENTS.md</code></a
	>、クレートの詳細は
	<a href="https://github.com/baseballyama/rsvelte/blob/main/crates/README.md"
		><code>crates/README.md</code></a
	> にあります。
</p>
