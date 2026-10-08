<script lang="ts">
	import type { PageData } from './$types';
	import ParseSharingFigure from '$lib/widgets/ParseSharingFigure.svelte';
	import ProjectFactsFigure from '$lib/widgets/ProjectFactsFigure.svelte';
	import SvelteSourceFigure from '$lib/widgets/SvelteSourceFigure.svelte';
	import { REPO_URL } from '$lib/site';

	let { data }: { data: PageData } = $props();

	const sections = [
		{ id: 'whole-file', label: 'テンプレートの構文解析' },
		{ id: 'extensions', label: '独自のlintルール' },
		{ id: 'sharing', label: '解析結果の共有' },
		{ id: 'project', label: 'クロスファイル最適化' },
		{ id: 'today', label: '実装状況' }
	];
</script>

<svelte:head>
	<title>なぜrsvelteを作るのか — rsvelte</title>
	<meta name="description" content="Svelteのテンプレートを含む解析、独自の検査ルール、ツール間の解析結果の共有、コンパイル前のクロスファイル最適化。rsvelteが解決したい問題と、現在の実装範囲を説明します。" />
</svelte:head>

<main class="why">
	<header class="intro">
		<p class="eyebrow">プロジェクトの目的</p>
		<h1>なぜrsvelteを<br />作るのか</h1>
		<p class="lead">rsvelteは、Svelteの構文木と名前解決の結果を、lint・format・compileで共有するRust製のツールチェーンです。テンプレート内の変数参照やバインディングを含む解析結果を、独自のルールやコンパイラから利用できる構成を目指しています。</p>
		<p>対象はまずSvelte 5のrunesモードです。構文解析、解析結果のキャッシュ、タスクの登録と実行を共通化し、各ツールでの再解析や、独自ルールに必要な解析処理の重複を減らします。実装は実験段階です。</p>
		<div class="premise"><span>説明する範囲</span><p>テンプレート解析、独自ルールの登録、タスク間のキャッシュ共有を順に説明します。クロスファイル最適化は未実装の設計です。図はデータの依存関係と判断条件を示すモデルで、実測値ではありません。</p></div>
	</header>

	<nav class="contents" aria-label="このページの目次">
		{#each sections as section, index}<a href="#{section.id}"><span>0{index + 1}</span>{section.label}</a>{/each}
	</nav>

	<section id="whole-file">
		<p class="eyebrow">01 · 言語の対応範囲</p>
		<h2>OxlintはSvelteの<br />テンプレートを解析しない</h2>
		<p>Svelteでは、スクリプトで宣言した変数をテンプレートから参照できます。下の例では、式 <code>&#123;name&#125;</code> が変数の読み取り、<code>bind:value=&#123;name&#125;</code> が入力イベントに伴う書き込みを含みます。この関係を解析するには、JavaScriptの構文木に加えて、Svelteのテンプレートの構文木と名前解決が必要です。</p>
		<SvelteSourceFigure markup={data.examples} />
		<p>OxcはJavaScriptとTypeScriptの解析や変換のためのツール群です。OxlintはSvelteやVueのファイルでもスクリプト部分を検査できます。ただし、公式の対応表ではテンプレートの検査は未対応とされています。Oxfmtでは、Svelteの整形に別途 <code>svelte/compiler</code> が必要です。<a href="https://oxc.rs/compatibility">公式の対応表</a>と<a href="https://oxc.rs/docs/guide/usage/linter">Oxlintの対象範囲</a>で確認できます。</p>
		<p>スクリプト内の宣言だけを解析しても、テンプレート内の参照先や書き込み先は得られません。変数の使用状況、バインディングの妥当性、未使用のスタイルなどを検査するには、テンプレートを含む解析が必要です。</p>
		<p>rsvelteはJavaScript、テンプレート、スタイルの構文木を保持します。名前解決では、テンプレート内の識別子を、スクリプトの宣言やテンプレート内のローカル変数に対応付けます。変数のスコープや参照先は構文木とは別の表に保存し、lintとcompileから利用します。一般的なJavaScriptルールの網羅性より、Svelte固有の意味解析を優先します。</p>
		<p class="reading">設計の詳細：<a href="/learn/kernel/layers">構文木と解析結果の持ち方</a></p>
	</section>

	<section id="extensions">
		<p class="eyebrow">02 · 拡張性</p>
		<h2>独自のlintルールに、<br />テンプレートと名前解決を提供する</h2>
		<p>たとえば「フォームの送信には、指定したモジュールからimportした SubmitButton だけを使う」という独自ルールを考えます。タグ名の一致だけでは、同名の別コンポーネントを区別できません。テンプレートの要素と、import宣言への名前解決が必要です。</p>
		<p>ESLintには<a href="https://eslint.org/docs/latest/extend/custom-rules">独自ルールの仕組み</a>があり、OxlintもJavaScript製のプラグインに対応しています。ルールを追加できることと、ルールから対象言語の構文木や意味解析を利用できることは、別の条件です。Oxlintの<a href="https://oxc.rs/docs/guide/usage/linter/js-plugins#api-support">プラグインの対応範囲</a>には、SvelteやVueなどの独自形式とパーサーは未対応と記載されています。</p>
		<div class="extension-flow" aria-label="独自ルールが使う入力と出力">
			<div><span>既存の言語プラグイン</span><strong>テンプレートの構文木・名前解決</strong></div><b aria-hidden="true">→</b>
			<div><span>追加する処理</span><strong>独自のlintルール</strong></div><b aria-hidden="true">→</b>
			<div><span>利用者に返す結果</span><strong>ソース範囲を持つ診断</strong></div>
		</div>
		<p>rsvelteでは、Rustのタスクを登録し、既存の構文解析結果や名前解決の結果を取得できます。独自の検査は、そのデータを参照して条件を判定し、診断を返します。必要な解析結果は文書ごとのキャッシュから取得するため、ルール側に別のパーサーや名前解決を実装する必要がありません。</p>
		<p>構文木のノードは元のソースの範囲を保持します。診断はその範囲を使い、共通の出力処理で行・列に変換できます。新しい言語プラグインでも、ソース管理、キャッシュ、診断、スケジューラを再利用します。</p>
		<div class="premise"><span>現在できる拡張</span><p>現在の拡張は、Rustで実装したタスクや解析処理を、ホストプログラムに静的にリンクする方式です。設定ファイルから任意のプラグインを読み込む仕組みや、ESLint製ルールをそのまま動かす互換性は、まだ提供していません。</p></div>
		<p class="reading">動く実装例：<a href="/learn/plugins">プラグインを実装する</a></p>
	</section>

	<section id="sharing">
		<p class="eyebrow">03 · 構文解析の重複</p>
		<h2>4種類の処理に、<br />同じSvelteの構文木を渡す</h2>
		<p>lint、format、compileを別々のプロセスで実行する構成では、各ツールがソースから独自の構文木を生成します。ESLintでSvelteを解析した結果は、通常、そのままPrettierやSvelteコンパイラには渡されません。同じ入力でも、プロセスごとに構文解析が発生します。</p>
		<p>一つのlint実行内での構文木の共有や、未変更ファイルを省略するキャッシュは、既存ツールにもあります。rsvelteが共通化するのは、種類の異なるタスクが同じ文書から生成する構文木と解析結果です。</p>
		<p>下の例では、同じSvelteファイルにフォーマット、Lint、コンパイル、型検査を選んでいます。文書内の処理を順に実行し、型検査は全ファイルの検査用TypeScriptがそろった後に行います。工程の枠を選ぶと、その時点の入力と生成データを確認できます。</p>
		<p>図では、ソースの構造を保持するAST（抽象構文木）と、コンパイラ向けに整理したHIR（高水準の中間表現）を区別します。スコープや参照先は、ノードの識別番号で引くサイドテーブルに保存します。</p>
		<div class="data-structures">
			<table>
				<caption>パイプラインが保持する主なデータ構造</caption>
				<thead><tr><th scope="col">データ構造</th><th scope="col">保持する情報</th><th scope="col">利用する処理</th></tr></thead>
				<tbody>
					<tr><th scope="row">ソースAST<br /><code>Component</code></th><td>テンプレートのノード、JavaScript/TypeScript AST、スタイルの構文木、元のソース範囲。字句トークンも保持する。</td><td>フォーマット、HIR生成、Lint、型検査用コードの生成。</td></tr>
					<tr><th scope="row">JavaScript/TypeScript AST<br /><code>SyntaxTree</code></th><td>スクリプトとテンプレート内のJavaScript式を、同じ木に格納する。</td><td>スコープ・参照解析、Lint、コンパイル。</td></tr>
					<tr><th scope="row">テンプレートHIR<br /><code>CompilerSyntaxTree</code></th><td>分岐や属性を整理したノード、親子関係、元のテンプレートとの対応。JavaScript式はJavaScript/TypeScript ASTのノードを参照する。</td><td>スコープ・参照解析、Lint、コンパイル用の解析と描画計画。</td></tr>
					<tr><th scope="row">スコープ・参照のサイドテーブル<br /><code>Resolution</code>・<code>Semantic</code></th><td>スコープ、宣言、参照先、読み書き、Svelte固有の宣言種別。ASTやHIRのノードに書き込まず、別の表に保存する。</td><td>Lint、コンパイル。</td></tr>
					<tr><th scope="row">コンパイル用の解析結果・描画計画<br /><code>Analysis</code>・<code>RenderPlan</code></th><td>式の依存関係、動的な断片、スタイルの対応、描画する領域の計画。</td><td>出力JavaScript ASTの生成、スタイルの生成。</td></tr>
					<tr><th scope="row">出力JavaScript AST<br /><code>LoweredModule</code></th><td>コンパイル先に合わせて新しく生成した <code>SyntaxTree</code>。元のソースASTとは別の木。</td><td>JavaScriptテキストの出力。</td></tr>
					<tr><th scope="row">型検査用テキスト・位置対応表<br /><code>TypeScriptDocument</code>・<code>Emitter</code></th><td>元のソースASTから生成したTypeScriptと、元のSvelteの位置への対応。テンプレートHIRや出力JavaScript ASTとは別のデータ。</td><td>外部の型検査器、診断位置の変換。</td></tr>
				</tbody>
			</table>
		</div>
		<ParseSharingFigure markup={data.pipeline} />
		<p>図の「スコープ構築・参照解析」では、識別子と宣言の対応付けに加えて、次のデータを生成します。</p>
		<ul>
			<li>スコープ表：関数、ブロック、テンプレートの <code>&#123;#each&#125;</code> などが作るスコープと、その親子関係。</li>
			<li>宣言表：変数やimportの宣言と所属スコープ。Svelte側では、<code>$state</code> やpropsなどの宣言種別も記録します。</li>
			<li>参照表：識別子の参照先と読み書き。<code>bind:value</code> のようなテンプレート側の書き込みも解析対象です。</li>
		</ul>
		<p>制御フロー解析は、これとは別の処理です。分岐やループを通る実行経路と、識別子が属するスコープは異なる情報です。到達可能性や経路ごとの代入状態を調べる処理では、制御フローの情報が必要になります。現在のrsvelteのスコープ・参照解析は、制御フローグラフを生成していません。型検査は生成したTypeScriptを外部の型検査器に渡すため、その内部の解析も文書コンテキストの共有対象には含まれません。</p>
		<p class="reading">実装：<a href="{REPO_URL}/blob/experimental/crates/languages/typescript/core/src/semantic/scope.rs">2パスのスコープ・参照解析</a>と<a href="{REPO_URL}/blob/experimental/crates/languages/svelte/semantic/src/semantic/resolve.rs">Svelteのテンプレートとrunesの解析</a></p>
		<p>タスクは文書の実行コンテキストから、型を指定して解析結果を要求します。最初の要求で計算し、同じ結果への後続の要求にはキャッシュを返します。formatだけを選んだ場合は、コード生成用の計算結果を要求しません。依存関係は、各計算処理が要求する結果によって決まります。</p>
		<p>共有する構文木は不変です。コンパイルの変換処理は別の構文木を生成し、lintやformatが参照する元の構文木を変更しません。途中のコードを文字列として出力し、再解析して次の変換を続ける設計も採りません。</p>
		<p>キャッシュの有効期間は、同じ文書のスナップショットを処理する実行コンテキスト内です。別々のコマンドを起動しても共有される永続キャッシュや、編集前後の結果を使う仕組みは未実装です。型検査用に生成したTypeScriptは外部の型検査器が読むため、ツール全体からすべての構文解析をなくすわけでもありません。</p>
		<p>共有の効果は、同じ入力とタスクで「共有する場合」と「個別に計算する場合」を比べて測ります。<a href="/learn/measure#arms">測定条件と結果</a>を公開しています。この比較だけで、公式ツールよりアプリ全体のビルドが速いとは判断できません。</p>
	</section>

	<section id="project">
		<p class="eyebrow">04 · 将来の設計</p>
		<h2>全呼び出し元のpropsを解析し、<br />Svelteのコンパイル前に最適化する</h2>
		<p>子コンポーネントが <code>$props()</code> で受け取る <code>tone</code> に、すべての呼び出し元が <code>"quiet"</code> を渡す場合を考えます。子のソースだけでは、その値が全呼び出しで定数かどうかを証明できません。呼び出し元のテンプレートとimportの解決結果を集めれば、定数への置き換えを検討できます。</p>
		<p>公式の <a href="https://svelte.dev/docs/svelte/svelte-compiler#compile">Svelteのコンパイル関数</a>は、一つのコンポーネントのソースと設定を受け取ります。全モジュールのimport関係や、各呼び出し箇所のpropsは入力に含まれません。そのため、通常のコンポーネント単位のコンパイルでは、すべての呼び出し元を前提にした最適化はできません。</p>
		<ProjectFactsFigure />
		<p>設計では、各ファイルの構文木と名前解決から、import、コンポーネントの呼び出し箇所、渡されるpropsの要約を生成します。要約をプロジェクト全体で結合し、各コンポーネントの全呼び出しを把握できるか判定します。定数の一致と変換の安全条件を満たした場合に、新しいコンパイル用の構文木を生成します。</p>
		<ol class="project-flow">
			<li><span>各ファイル</span><strong>呼び出し箇所の要約を生成</strong><p>import先と渡すpropsを記録する。</p></li>
			<li><span>プロジェクト全体</span><strong>要約を結合して条件を判定</strong><p>全呼び出しと定数値を証明する。</p></li>
			<li><span>コンパイルの前</span><strong>Svelteの構文木を変換</strong><p>元の木を保持し、意味解析を更新する。</p></li>
			<li><span>コンパイルの後</span><strong>JavaScriptをバンドル</strong><p>生成後の最適化はRolldownやOxcに任せる。</p></li>
		</ol>
		<p>RolldownやOxcは、生成後のJavaScriptに対して最適化できます。一方、Svelteのpropsの受け取り方やリアクティビティは、生成後にはランタイム関数の呼び出しとして表現されます。Svelteの構文木を直接変換する段階なら、propsの宣言と参照を解析結果から取得できます。生成コードのパターンを逆に解釈して、Svelteの意味を復元する必要がありません。</p>
		<p>ただし、定数化にはpropsへの代入、<code>$bindable</code>、デフォルト値の評価順序と副作用を確認する必要があります。属性のスプレッド、動的なコンポーネント参照、外部へのexportがあれば、値や呼び出し元を確定できない場合があります。不明な情報は最適化の根拠にしません。現在の設計では、定数化から派生する <code>&#123;#if&#125;</code> の分岐削除も対象外です。</p>
		<div class="premise"><span>最適化の実装と効果は未確認</span><p>この処理は未実装で、速度や出力サイズの改善も未測定です。利用者が明示的に有効にする方式を計画しています。実装時には、描画結果、リアクティブな更新、イベントの実行順序、サーバーレンダリングとハイドレーションの等価性を検証します。</p></div>
		<p class="reading">前提と反例：<a href="{REPO_URL}/blob/experimental/docs/project.md#x4-cross-file-optimization--verdict-modify-opt-in-closed-components-only-provable-rewrites-only">クロスファイル最適化の設計レビュー</a></p>
	</section>

	<section id="today">
		<p class="eyebrow">05 · 実装状況</p>
		<h2>実装済みの機能と、<br />未実装の設計</h2>
		<p>すでにSvelte向けのツールを使っているなら、対応している構文と出力の正しさが、置き換えを考える最初の条件になります。rsvelteは実験段階で、実際のソースに未対応の構文があります。速さだけで選べる状態にはありません。</p>
		<div class="status-grid">
			<div><span class="status-label">実装あり</span><h3>文書内での解析結果の共有</h3><p>言語プラグインが保存した結果を、検査・整形・コンパイルのタスクから取得できます。</p><a href="/learn/playground">処理の流れを試す →</a></div>
			<div><span class="status-label">Rustでの組み込み</span><h3>独自のタスクの登録</h3><p>既存の構文解析結果を使う実装例があります。配布用の動的プラグインは未提供です。</p><a href="/learn/plugins">実装例を読む →</a></div>
			<div><span class="status-label planned">未実装</span><h3>クロスファイル最適化と永続キャッシュ</h3><p>設計を検討しています。実際のアプリでの改善は、今後の実装と測定が必要です。</p><a href="{REPO_URL}/blob/experimental/docs/project.md">プロジェクト全体の設計を読む →</a></div>
		</div>
		<p>一般的なJavaScriptのlintにはOxlintの既存ルールがあり、Svelte向けには公式のコンパイラや検査ツールがあります。rsvelteの主な検証対象は、テンプレートの解析結果を使う独自タスクと、lint・format・compile間でのキャッシュ共有です。既存ツールの全面的な代替は、対応構文と出力の比較で判断する必要があります。</p>
		<p>このプロジェクトでは、公式ツールの出力と比較し、未対応として拒否した入力も含めて結果を公開しています。<a href="/#ledger">現在の一致状況</a>と<a href="/learn/measure">性能の測定</a>を、対応範囲の判断に使ってください。</p>
	</section>

	<aside class="references" aria-labelledby="references-title">
		<h2 id="references-title">根拠と、続けて読める資料</h2>
		<p>外部ツールの対応範囲は2026年10月2日に公式資料で確認しました。今後変わるため、導入時にはリンク先の情報も確認してください。</p>
		<ul>
			<li><a href="https://oxc.rs/compatibility">OxlintとOxfmtの対応表</a> / <a href="https://oxc.rs/docs/guide/usage/linter/js-plugins">Oxlintの独自プラグイン</a></li>
			<li><a href="https://eslint.org/docs/latest/extend/custom-rules">ESLintの独自ルール</a> / <a href="https://svelte.dev/docs/svelte/svelte-compiler">Svelteのコンパイル関数</a></li>
			<li><a href="{REPO_URL}/blob/experimental/docs/concept.md">rsvelteの設計原則と検討した反例</a></li>
			<li><a href="{REPO_URL}/blob/experimental/docs/architecture.md">実装の構成と測定方法</a> / <a href="{REPO_URL}/blob/experimental/docs/project.md">プロジェクト全体の処理の設計</a></li>
		</ul>
	</aside>
</main>

<style>
	.why { max-width: 1080px; margin: 0 auto; padding: 64px 24px 0; }
	.intro { max-width: 780px; }
	h1 { margin: 20px 0 32px; font-size: clamp(42px, 7vw, 76px); line-height: 1.18; font-weight: 600; letter-spacing: 0.01em; }
	.lead { font-size: clamp(18px, 2vw, 22px); color: var(--fg); }
	p { font-size: 16px; line-height: 2; color: var(--fg-2); margin: 20px 0; overflow-wrap: anywhere; }
	a { color: var(--accent); text-decoration: underline; text-underline-offset: 4px; }
	a:hover { text-decoration-thickness: 2px; }
	.contents { display: flex; flex-wrap: wrap; gap: 12px 24px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 22px 0; margin: 48px 0 64px; }
	.contents a { font-size: 14px; color: var(--fg-2); text-decoration: none; }
	.contents span { margin-right: 8px; font-family: var(--font-mono); color: var(--accent); }
	section { scroll-margin-top: 90px; margin-top: 88px; }
	h2 { font-size: clamp(26px, 4vw, 38px); line-height: 1.5; font-weight: 600; margin: 12px 0 28px; }
	section > p { max-width: 760px; }
	.premise { border-left: 3px solid var(--border-strong); padding: 16px 22px; background: var(--sunken); margin-top: 28px; max-width: 780px; }
	.premise > span { font-size: 13px; font-weight: 600; }
	.premise p { font-size: 14px; margin: 8px 0 0; }
	.reading { font-size: 14px; }
	.data-structures { overflow-x: auto; margin: 28px 0; border: 1px solid var(--border); border-radius: 8px; }
	table { width: 100%; min-width: 650px; border-collapse: collapse; font-size: 13px; line-height: 1.8; }
	caption { padding: 16px; text-align: left; font-weight: 600; background: var(--sunken); }
	th, td { padding: 14px 16px; text-align: left; vertical-align: top; border-top: 1px solid var(--border); }
	th { font-weight: 600; }
	tbody th { width: 28%; }
	td { color: var(--fg-2); }
	.extension-flow { display: flex; align-items: center; gap: 14px; margin: 32px 0; }
	.extension-flow > div { flex: 1; border: 1px solid var(--border); border-radius: 8px; padding: 22px 16px; background: var(--sunken); }
	.extension-flow span, .project-flow span { display: block; color: var(--muted); font-size: 12px; margin-bottom: 8px; }
	.extension-flow strong { font-size: 14px; }
	.extension-flow b { color: var(--accent); }
	.project-flow { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; list-style: none; padding: 0; margin: 32px 0; counter-reset: phase; }
	.project-flow li { padding: 20px 16px; border-top: 2px solid var(--accent); background: var(--sunken); counter-increment: phase; }
	.project-flow li::before { content: '0' counter(phase); display: block; color: var(--accent); font-family: var(--font-mono); margin-bottom: 16px; }
	.project-flow strong { font-size: 14px; }
	.project-flow p { font-size: 13px; line-height: 1.8; margin-bottom: 0; }
	.status-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 32px 0; }
	.status-grid > div { border: 1px solid var(--border); border-radius: 10px; padding: 24px; }
	.status-label { font-size: 12px; color: var(--accent); }
	.status-label.planned { color: var(--muted); }
	h3 { font-size: 18px; line-height: 1.6; font-weight: 600; margin-top: 12px; }
	.status-grid p, .status-grid a { font-size: 14px; }
	.references { margin-top: 72px; padding-top: 28px; border-top: 1px solid var(--border); }
	.references h2 { font-size: 20px; }
	.references p, .references li { font-size: 13px; line-height: 2; }
	.references ul { list-style: disc; padding-left: 20px; }
	@media (max-width: 760px) { .why { padding: 40px 20px 0; } .status-grid { grid-template-columns: 1fr; } .extension-flow { flex-direction: column; align-items: stretch; } .extension-flow b { text-align: center; transform: rotate(90deg); } .project-flow { grid-template-columns: 1fr 1fr; } section { margin-top: 64px; } }
</style>
