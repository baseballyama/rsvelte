<script lang="ts">
	import type { PageData } from './$types';
	import Term from '$lib/components/Term.svelte';
	import KernelModuleFigure from '$lib/widgets/KernelModuleFigure.svelte';
	import KernelOverview from '$lib/widgets/KernelOverview.svelte';
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import DeepDive from '$lib/components/DeepDive.svelte';
	import Figure from '$lib/components/Figure.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';

	let { data }: { data: PageData } = $props();
	const c = chapter('kernel', 'ja');

	const life = [
		{ functionName: 'Registry::document', label: '元のソースを持つ文書を作る', what: 'Document にパスとソース文字列を保存し、サイズの上限を確かめる。この時点では構文木も解析結果もない。', href: '/learn/kernel/pipeline#document' },
		{ functionName: 'run_each', label: '選ばれたタスクを文書ごとに実行する', what: 'タスクの識別番号で実行候補を選び、文書を rayon のワーカーに配る。各タスクはパスや内容から処理対象かを判断する。', href: '/learn/kernel/pipeline#run-each' },
		{ functionName: 'run_document', label: '文書ごとの保存領域を用意する', what: '最初のタスクを実行するときに DocumentContext を作る。元の文書を参照し、計算結果を保存する場所を用意する。この時点では構文解析はしない。', href: '/learn/kernel/pipeline#run-document' },
		{ functionName: 'Task::run / DocumentContext::get', label: '必要になった木と解析結果を作る', what: '各タスクは DocumentContext::get で必要な計算結果を求める。構文解析、名前解決、コンパイル用の木の作成、言語ごとの解析を、必要になったときに行う。一度計算した結果は保存し、後のタスクでも再利用する。', href: '/learn/kernel/database#get' },
		{ functionName: 'TaskOutput', label: 'compile・format・lint の結果を保存する', what: 'コンパイルは言語プラグインが定める形式のファイルを作る。整形は書き直したソースを、コード検査はエラーや警告を返す。出力は TaskOutput に入れ、元の構文木や解析結果とは別に保持する。', href: '/learn/kernel/emitter' },
		{ functionName: 'FinishTask::prepare', label: '型検査に渡す文書ごとのデータを作る', what: '型検査も選ばれていれば、同じ文書ごとの保存領域から 型検査用のコードと位置情報 を求める。TypeScript で型検査するプラグインの場合は、元の構文木から検査用コードを作る。prepare はその文字列、元ソースへの位置対応表、型宣言の設定、元ソースのコピーを Part にまとめる。コンパイル済みの JavaScript は使わない。', href: '/learn/kernel/pipeline#tasks' },
		{ functionName: 'FinishTask::finish', label: '文書ごとのデータを集めて型検査する', what: '全文書の処理後に Part をタスクごとに集め、TypeScript のコンパイラで型を調べる。指摘の位置を元のソース上の位置に戻し、各文書の TaskOutput に加える。文書ごとの保存領域は、この時点で解放されている。', href: '/learn/kernel/pipeline#project' },
		{ functionName: 'sink', label: '結果が揃った文書を呼び出し側に渡す', what: 'Part を返さなかった文書は文書処理の直後に、返した文書は finish の後に sink へ渡す。呼び出し側は TaskOutput のファイルや診断を受け取る。', href: '/learn/kernel/pipeline#run-each' }
	];
	const structures = [
		{ name: 'Document', content: 'ファイルのパスと元のソース文字列。言語や構文木は持たない。', lifetime: '文書の処理中。文書ごとの保存領域が参照する。' },
		{ name: '構文木（言語ごとの型）', content: '言語プラグインがソースから作る木と、空白・コメントを含むトークン。埋め込み言語があれば、その構文木も保持する。', lifetime: '最初の要求で作り、文書ごとの保存領域のキャッシュに保持する。' },
		{ name: '解析結果の表（言語ごとの型）', content: '変数がどの宣言を参照するかなどの解析結果。ノードや束縛の識別番号で引く別の表に持ち、元の構文木を書き換えない。', lifetime: '必要になったものだけ作り、文書ごとの保存領域に保持する。' },
		{ name: '変換後の木（言語ごとの型）', content: '出力先の処理に適した形へ組み直した木。元の構文木とは別に作り、元の構文との対応も持つ。', lifetime: '必要になったときに作り、文書ごとの保存領域に保持する。' },
		{ name: 'TaskOutput', content: '生成したファイルの名前と文字列、エラーや警告。構文木や解析の表とは別に持つ。', lifetime: '文書処理の後も保持し、結果が揃ったら sink に渡す。' },
		{ name: 'Part（型検査の場合）', content: '型検査用の TypeScript、元ソースへの位置対応表、型宣言の設定、元ソースのコピー。構文木の参照は持ち越さない。', lifetime: 'prepare で作り、全文書の処理後に finish が受け取る。' }
	];
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="カーネルは、構文解析の結果の保存や処理の実行など、各言語に共通する機能をまとめたものです。言語プラグインが、構文解析やコンパイルなどの言語固有の処理を登録します。この章では、各モジュールの役割と、入力から出力までの手順を説明します。"
/>

<div class="prose-learn">
	<H2 id="why" />
	<p>
		同じソースをコンパイルし、整形やコード検査、型検査も選ぶ場合、それぞれが構文解析を始めると、同じ計算を繰り返します。
		各処理が必要な構文木や解析結果を共有できれば、一度計算した値を再利用できます。
	</p>
	<p>
		言語が違っても、ソースの位置を行と列に直す仕組みや、計算結果を保存する仕組みは共通にできます。
		構文木の形や変数を参照できる範囲の規則は言語ごとに異なるため、言語プラグインが決めます。
		エラーや警告の報告、出力文字列の組み立て、生成したコードの位置を元のソースに対応させる処理も共通です。
		rsvelte はこれらを一つの Rust ライブラリにまとめました。それがカーネルです。
	</p>
	<p>
		分け方の基準は一つだけです。<strong>扱う言語が変わると、処理の規則も変わるか。</strong>書き直さないもの、つまりスケジューラ、計算結果のキャッシュ、元のソース位置を求める処理、文書プリンタはカーネルに置きます。lint ルールの走らせ方と並び順は、カーネルではなく rsvelte_lint に置きます。
	</p>
	<p>
		この基準は、実際に二つ目の言語を足して試されています（<a href="#languages">二つ目の言語</a>）。
	</p>

	<H2 id="overview" />
	<p>
		次の図は、言語プラグインとカーネルとホストが、何を登録し、どの順にデータを渡すかを示します。四角はそれぞれの部分を説明する章へのリンクです。
		後の章では、冒頭にこの図での位置を示します。
	</p>
</div>

<KernelOverview />

<div class="prose-learn">
	<p>
		図の左の言語プラグインは、構文木や名前解決などの計算結果の型と、コンパイルや整形などのタスクを登録します。
		ホストは文書を作り、カーネルの実行を呼びます。カーネルは文書ごとにタスクを呼び、タスクが求めた計算結果を一度だけ計算して保存します。
		全文書の準備が終わると、型検査のようなまとめる処理を一度だけ呼びます。
	</p>

	<H2 id="layers" />
	<p>依存は一方向で、下に行くほど言語から遠くなります。</p>
</div>

<Figure label="図 1.2 · crate の役割と依存の向き">
	<div class="overflow-x-auto px-4 py-5">
		<ol class="flex min-w-[640px] items-stretch gap-2 font-mono text-[12.5px] tracking-normal">
			{#each [['rsvelte_command_line · rsvelte_kernel_browser', 'ホスト：コマンドラインとブラウザ'], ['rsvelte_svelte_compile · rsvelte_vue_lint · rsvelte_svue など', '言語の機能：コンパイル、整形、コード検査、型検査、言語間の変換'], ['rsvelte_svelte · rsvelte_vue · rsvelte_typescript など／rsvelte_lint など', '言語の中核と、共有の部品'], ['rsvelte_kernel', '言語を知らない']] as [name, role], i (name)}
				<li class="flex flex-1 items-center gap-2">
					<div class={['flex-1 rounded-sm border px-3 py-2', i === 3 ? 'border-fg bg-surface' : 'border-line-strong']}>
						<div class="font-medium text-fg">{name}</div>
						<div class="mt-0.5 text-[11.5px] text-muted">{role}</div>
					</div>
					{#if i < 3}<span class="text-muted" aria-hidden="true">→</span>{/if}
				</li>
			{/each}
		</ol>
	</div>
	{#snippet caption()}矢印は依存の向き。役割は crate のパスで決まり、<code>tools/structure</code> のテストが依存の向きを確かめる。言語の中核はカーネルと他の言語の中核だけに、共有の部品はカーネルだけに依存する。rsvelte_svue と rsvelte_svelte_compile_vapor は Svelte と Vue の両方の中核に依存する。カーネルが依存する外部の crate は rayon、semver、rustc-hash、sha2、unicode-width の五つ。{/snippet}
</Figure>

<div class="prose-learn">
	<p>
		カーネルの <code>lib.rs</code> の冒頭のコメントは、カーネルが持つものの一覧です。依存の向きの約束は、上の図のとおり <code>tools/structure</code> のテストが確かめています。
	</p>
	<blockquote class="border-l-0 font-mono text-[14px] leading-[1.7] text-fg-2">{data.libDocs}</blockquote>
	<p>
		プラグインは、計算結果の型やタスクを <code>Registry</code> に登録します。登録する型やタスクの数は言語ごとに決めます。
		次の Svelte プラグインの <code>register</code> は、構文木や名前解決などの計算結果を登録する例です。
		コンパイルや整形などのタスクは、それぞれのツールが登録します。
		複数の言語から同じ形式の結果を受け取る共通窓口については、<a href="/learn/kernel/database#facet">04</a>で説明します。
	</p>
</div>

<Code item={data.code.register} />

<div class="prose-learn">
	<p>登録を受け取る <code>Registry</code> は、タスク・プロジェクトタスク、計算結果・共通の呼び出し窓口、プラグインの宣言の登録を持ちます。</p>
</div>

<Code item={data.code.registry} />

<div class="prose-learn">
	<H2 id="modules" />
	<p>
		ホストは文書を作り、選んだタスクをカーネルに渡します。言語プラグインは必要な構文木や解析結果を求め、出力を返します。
		カーネルのモジュールは、この実行と保存を支えます。
	</p>
</div>

<Figure label="図 1.3 · 言語に共通する実行の流れ">
	<ol class="grid gap-3 p-5 sm:grid-cols-3">
		<li><strong>1. 文書を作る</strong><p>ホストがパスとソースを渡す。</p></li>
		<li><strong>2. タスクを実行する</strong><p>言語プラグインが必要な計算結果を求め、文書ごとに再利用する。</p></li>
		<li><strong>3. 出力を返す</strong><p>生成したファイルと診断を呼び出し側へ渡す。</p></li>
	</ol>
	{#snippet caption()}他の文書も必要な処理は、文書ごとのデータを準備してからまとめて実行します。構文木の型や出力形式は言語プラグインが決めます。{/snippet}
</Figure>

<div class="prose-learn">
	<p>
		カーネルの「処理の登録と実行」が、選んだ処理を文書ごとに順に呼び出します。
		「計算結果の保存と再利用」は、言語プラグインが作る構文木や名前解決の表を保持します。
		整形は文書プリンタを使い、コード検査は rsvelte_lint のルールの実行と指摘の書き出しを使い、カーネルからはエラーや警告の型と位置の変換を使います。
		コンパイルと型検査用コードの生成では、文字列の出力と位置の対応付けを使います。
	</p>
	<p>
		たとえば TypeScript で型検査する場合は、検査用コード、位置の対応表、型宣言の設定、元ソースのコピーを準備した後、文書ごとの構文木と解析結果は解放します。
		全文書の準備が終わると、型検査器が TypeScript を解析して型を調べます。
		位置の対応表で指摘を元のソースに戻し、整形・コード検査・コンパイルの出力と合わせて呼び出し側へ返します。
	</p>
</div>

<details class="my-8">
	<summary class="cursor-pointer text-[14px] font-medium text-fg-2">カーネルのモジュールと実装ファイルを見る</summary>
	<KernelModuleFigure modules={data.modules} />
</details>

<div class="prose-learn">
	<p>
		実装は {data.modules.length} のモジュールに分かれています<Note>
			<code>lib.rs</code> は <code>pub mod</code> と再エクスポートだけなので数えていません。</Note
		>。「カーネルのモジュールと実装ファイルを見る」を開くと、役割ごとの一覧を確認できます。各グループの「実装ファイルと行数」に説明と行数を示します。行数はテストを含み、ビルドのたびに数え直しています。
	</p>

	<H2 id="life" />
	<p>
		一つの文書にコンパイル、整形、コード検査、型検査を選んだ場合を追います。
		構文木と解析結果の型はプラグインが決めます。ここでの <code>Part</code> は TypeScript による型検査の例です。
		まず、保持するデータを整理します。<Term name="DocumentContext" /> は文書ごとの計算結果を保存する場所で、
		構文木や解析結果はその中に、成果物の型ごとに分けて保持します。
	</p>
	<table class="table">
		<thead><tr><th>データ</th><th>中身</th><th>いつ保持するか</th></tr></thead>
		<tbody>
			{#each structures as structure (structure.name)}
				<tr><td><code>{structure.name}</code></td><td>{structure.content}</td><td>{structure.lifetime}</td></tr>
			{/each}
		</tbody>
	</table>
	<p>
		解析結果の表は、たとえば「この識別子の番号 → 参照先の宣言」という対応表です。
		木そのものに解析用の印を書き込む代わりに、別の表に保存します。コンパイル用に整理した構文木は対応表ではなく、構文木から作る別の木です。
	</p>
	<p>
		以下は実行の流れです。<code>Task::run</code> の中から <Term name="DocumentContext::get" /> を呼ぶので、
		木や表の計算はタスクが必要とした時点で起きます。全タスクの前に全解析を済ませるわけではありません。
	</p>
</div>

<ol class="my-8 border-l border-line-strong">
	{#each life as step, i (step.functionName)}
		<li class="relative pb-5 pl-6 last:pb-0">
			<span class="absolute top-[0.55em] -left-[4.5px] h-2 w-2 rounded-[1px] bg-fg" aria-hidden="true"></span>
			<div class="flex flex-wrap items-baseline gap-x-3">
				<span class="font-mono text-[12px] tracking-normal text-muted">{i + 1}</span>
				<a href={step.href} title="コード上の名前: {step.functionName}" class="text-[14px] hover:text-accent">{step.label}</a>
			</div>
			<p class="mt-1 text-[15.5px] leading-[1.75] text-fg-2">{step.what}</p>
		</li>
	{/each}
</ol>

<div class="prose-learn">
	<p>
		現在の実装では、文書内の compile・format・lint が先に走り、型検査の <code>prepare</code> がその後に走ります。
		compile も選んでいれば、この時点で JavaScript とスタイルシートは生成済みです。
		型検査はその生成コードを検査するのではなく、元の構文木から別に作る TypeScript を検査します。
		今のコンパイル処理は、プロジェクト全体の型検査結果を入力にしていません。
	</p>
	<p>
		compile だけを選んだ場合、型検査の <code>prepare</code> と <code>finish</code> は走りません。
		型検査だけなら、compile の出力を作らずに、パースと TypeScript の生成から始まります。
		他のファイルの情報を使ってコンパイルする仕組みを入れる場合は、その情報を揃えてからコンパイルする段階が別に必要です。
	</p>
	<p>
		<code>run_document</code> が戻ると、<Term name="DocumentContext" /> とそこに保持した構文木・コンパイル用に整理した構文木・解析の表は解放されます。
		<code>finish</code> を待つのは出力と所有権を持つ <code>Part</code> です。文書を読み直したり、構文木を再パースしたりして型検査するわけではありません。
	</p>
</div>

<Code item={data.code.runDocument} mark={['shared.get_or_init(|| DocumentContext::new', 'catch_unwind', 'own = isolated()']} />

<div class="prose-learn">
	<p>
		<code>Sharing::Shared</code> ではすべてのタスクが同じ <code>shared</code> を使うので、同じパース成果物は文書ごとに一回だけ計算します。<code
			>Sharing::Isolated</code
		>
		はタスクごとに新しい <Term name="DocumentContext" /> を作ります。こちらは製品のためではなく、共有がどれだけ効くかを測るための比較用です。<code>shared</code>
		は最初に求められたときに作るので、タスクごとに計算する場合 では作られません。
	</p>

	<DeepDive title="なぜ文書ごとに並列化するのか">
		<p>
			並列化の単位を文書にすると、一つの文書に関わる計算は一つのワーカーの上で完結します。<Term name="DocumentContext" />
			は同期のためのロックを持たず（<code>!Sync</code>）、計算結果は <code>OnceCell</code> に入れるだけで済みます。
		</p>
		<p>
			タスクを連続して走らせるので、パース結果がまだキャッシュに残っているうちに compile、format、lint が同じ木を読みます。代わりに、一つの巨大な文書を複数のコアで処理できません。検証用のソースファイル集の文書は小さいので、今はこの割り切りが合っています。
		</p>
	</DeepDive>

	<H2 id="languages" />
	<p>
		カーネルが本当に言語を知らないかは、二つ目の言語を足してみるまで分かりません。<code>rsvelte_vue</code> は、それを試すために足した Vue
		の単一ファイルコンポーネントのプラグインです。Svelte と同じ仕組みで、次の計算結果を文書ごとに保存します。
	</p>
	<table class="table">
		<caption class="mb-3 text-left text-[14px] text-fg-2">Vue プラグインが保存する計算結果</caption>
		<thead><tr><th scope="col">役割</th><th scope="col">保存するもの</th></tr></thead>
		<tbody>
			<tr><th scope="row">構文解析（<code>Parsed</code>）</th><td>スクリプト・テンプレート・スタイルの構文木。構文解析に失敗した場合は、そのエラー。</td></tr>
			<tr><th scope="row">コンパイル用の木（<code>Lowered</code>）</th><td>Vue のコンパイラが扱う構造に変換したテンプレート。</td></tr>
			<tr><th scope="row">名前解決（<code>Resolved</code>）</th><td>変数の宣言と参照の対応、スクリプト内の各束縛の種類。</td></tr>
		</tbody>
	</table>
	<p>Vue プラグインの登録は、Svelte と同じ形をしています。</p>
</div>

<Code item={data.code.vueRegister} />
<Code item={data.code.vueParsed} />

<div class="prose-learn">
	<p>
		Vue プラグインには、コンパイル、整形、コード検査、型検査の四つの処理があります。
		コンパイルは Vue の公式プラグイン、整形は Prettier、コード検査は ESLint の出力に合わせています。
		型検査には vue-tsc と同じ形のコードを生成します。
		JavaScript の構文解析や出力処理、スタイルシートの処理は Svelte と共通です。
	</p>
	<p>
		二つ目の言語のために足したものは、次のとおりです（573ac584b6、a15cdcda04）。最初の一つは rsvelte_typescript に、残りはカーネルに足しました。どれも Vue に固有のものではなく、Svelte も使います。
	</p>
	<ul>
		<li>
			ホストが開くスコープ: スコープ解析（<code>rsvelte_typescript</code>）は、ホストの言語が渡す根を木として受け取ります。Vue の
			<code>v-for</code> は、テンプレートが開くスコープです。
		</li>
		<li>終端のない診断: ESLint の報告には位置が一つしかないものがあり、lint の書き出しはその終端を <code>null</code> と書きます。</li>
		<li>256ビットのハッシュ関数: カーネルの <code>sha256</code> です。Vue のスタイルの識別子を、公式のプラグインと同じ値にするために使います。</li>
		<li>
			共通の呼び出し窓口: 型検査のように、言語ごとに答え方が違う問いを、一つのタスクから尋ねる仕組みです（<a href="/learn/kernel/database#facet">04</a
			>）。
		</li>
	</ul>
	<p>
		さらに、二つのプラグインを組み合わせて、一方の言語のコンポーネントをもう一方のランタイムで動かす翻訳もあります。<code>rsvelte_svue</code> は
		<code>.vue</code> のコンポーネントを、Vue の意味のまま Svelte のランタイム向けにコンパイルします。Vue のパーサと名前解決、Svelte
		のコンパイラはそのまま使います。自分で持つのは、Vue の構文木を Svelte の runes を使うスクリプトとコンパイル用に整理した構文木に翻訳する部分だけです。<code
			>rsvelte_svelte_compile_vapor</code
		> は逆向きで、<code>.svelte</code> のコンポーネントを Svelte の意味のまま Vue のランタイム向けにコンパイルします（<a href="/learn/kernel/layers#svue"
			>05</a
		>）。
	</p>
	<p>crate の大きさ（<code>src/</code> の Rust の行数、テストを含む。ビルドのたびに数え直しています）:</p>
</div>

<figure class="my-8 overflow-x-auto">
	<table class="table">
		<thead><tr><th>crate</th><th class="num">ファイル</th><th class="num">行</th></tr></thead>
		<tbody>
			{#each data.crates as cr (cr.name)}
				<tr><td><code>{cr.name}</code></td><td class="num">{cr.files}</td><td class="num">{cr.lines.toLocaleString('en-US')}</td></tr>
			{/each}
		</tbody>
	</table>
</figure>

<div class="prose-learn">
	<H2 id="promises" />
	<p>カーネルのコードは、次の四つの約束に沿って書かれています。各章で、それぞれがどこに現れるかを見ていきます。</p>
	<ol>
		<li>
			<strong>近似しない。</strong>移植していない構文に出会ったタスクは、それらしい出力を作らず、<code>Unsupported</code>
			として報告してファイルを書きません。近似した出力は、一致率に偶然合ったものを混ぜてしまいます（<a href="/learn/kernel/diagnostics#unsupported">07</a>）。
		</li>
		<li>
			<strong>位置は u32 で持つ。</strong><code>Span</code> は 8 バイトで、ファイルの識別番号を持ちません。どの文書の位置かは、文脈から分かります（<a href="/learn/kernel/source#span">02</a>）。
		</li>
		<li>
			<strong>一度だけ計算する。</strong>タスクはパーサを直接呼ばず、計算結果を求めます（<a href="/learn/kernel/database">04</a>）。
		</li>
		<li>
			<strong>計測を最初から組み込む。</strong>計算結果とタスクとルールは、すべて名前のついたフェーズです。<code>metrics</code>
			feature を外すと、計測のコードはまったく残りません（<a href="/learn/kernel/measurement">11</a>）。
		</li>
	</ol>
</div>

<ChapterFooter chapter={c} />
