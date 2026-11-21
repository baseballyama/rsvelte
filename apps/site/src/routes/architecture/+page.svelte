<svelte:head>
	<title>仕組み ・ rsvelte</title>
</svelte:head>

<h1>仕組み</h1>

<p>
	rsvelte
	は各ファイルを一度だけ解析し、その結果をコンパイル、コード検査、整形、型検査で共有します。このページは、rsvelte
	の開発に参加する人向けの概要です。
</p>

<h2 id="flow">一度読んで共有する</h2>

<ol>
	<li>パーサーがソースを読み、構文木を作ります。構文木は作ったあと変更しません。</li>
	<li>
		意味解析は、変数のスコープなどの事実を構文木とは別の表に記録します。構文木と表は、ファイルごとのデータベースに保存されます。
	</li>
	<li>
		各タスク（<code>svelte.lint/default</code> など）は、必要な計算結果だけをデータベースに求めます。まだない結果はその場で計算され、ほかのタスクと共有されます。
	</li>
	<li>ファイルは 1 スレッドに 1 つずつ割り当てられ、並列に処理されます。</li>
</ol>

<p>
	テキストを出力して読み直すことはしません。ソース上の位置は、UTF-8 のバイト位置を表す
	<code>Span</code> の 1 種類だけです。
</p>

<h2 id="crates">クレートの構成</h2>

<table>
	<thead>
		<tr><th>ディレクトリ</th><th>役割</th></tr>
	</thead>
	<tbody>
		<tr>
			<td><code>crates/language_independent/</code></td>
			<td>
				どの言語も知らない部分。文書と位置、診断、計算結果のデータベース、タスクのスケジューラ（<code
					>kernel</code
				>）と、プラグインの接続口（<code>plugin_interface</code>）
			</td>
		</tr>
		<tr>
			<td><code>crates/languages/&lt;言語&gt;/</code></td>
			<td>
				言語ごとの構文解析（<code>syntax</code>）と意味解析（<code>semantic</code
				>）、各ツール（<code>compile</code>、<code>lint</code>、<code>format</code>、<code
					>check</code
				>）
			</td>
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
	各ツールは 1
	つのタスクを登録するクレートです。構文解析と意味解析はツールに依存しないので、全ツールが同じ解析結果を使えます。JavaScript
	と TypeScript の解析には <a href="https://oxc.rs/">oxc</a> を使います。
</p>

<h2 id="typecheck">型検査</h2>

<p>
	<code>typecheck</code> は Svelte コンポーネントを TypeScript のコードに変換します。TypeScript 7
	の型検査器はそのコードを検査し、エラーの位置を元の Svelte ファイルの位置に戻して返します。変換は
	<code>crates/languages/svelte/typescript_projection</code> にあります。
</p>

<h2 id="correctness">公式ツールとの比較</h2>

<p>
	<code>corpus/</code> には、MIT などの緩いライセンスで公開された実在の Svelte 5 ファイルがあります。各ファイルの期待する出力は、svelte
	や svelte-check などの公式ツールが作ります。
</p>

<p>
	<code>cargo test</code> は rsvelte の出力を期待する出力と比べ、ファイルごとに一致したかを記録します。記録と違う結果が出ると、テストが失敗します。
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
