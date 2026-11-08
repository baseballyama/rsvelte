<script lang="ts">
	import KernelModuleFigure from '#lib/widgets/KernelModuleFigure.svelte';
	import KernelOverview from '#lib/widgets/KernelOverview.svelte';
	import ChapterFooter from '#lib/components/ChapterFooter.svelte';
	import ChapterHeader from '#lib/components/ChapterHeader.svelte';
	import Code from '#lib/components/Code.svelte';
	import DeepDive from '#lib/components/DeepDive.svelte';
	import Figure from '#lib/components/Figure.svelte';
	import H2 from '#lib/components/H2.svelte';
	import Note from '#lib/components/Note.svelte';
	import { chapter } from '#lib/site.ts';

	let { data } = $props();
	const c = chapter('kernel');

	const life = [
		{
			functionName: 'Registry::document',
			label: '文書を作る',
			what: 'パスとソース文字列を Document に入れ、大きさの上限を確かめる。構文木も解析結果もまだない。',
			href: '/learn/kernel/pipeline#document',
		},
		{
			functionName: 'run_each',
			label: '選んだタスクを文書ごとに実行する',
			what: 'タスクの名前で実行するタスクを選び、文書を rayon のワーカーに配る。各タスクは、パスや内容から文書が処理対象かを判断する。',
			href: '/learn/kernel/pipeline#run-each',
		},
		{
			functionName: 'run_document',
			label: '文書ごとの保存領域を用意する',
			what: '最初のタスクを実行するときに DocumentContext を作る。元の文書を参照し、計算結果の置き場所を持つ。構文解析はまだしない。',
			href: '/learn/kernel/pipeline#run-document',
		},
		{
			functionName: 'Task::run / DocumentContext::get',
			label: '必要になった木と解析結果を作る',
			what: '各タスクは DocumentContext::get で計算結果を求める。構文解析、名前解決、コンパイル用に整理した構文木の作成などは、求められたときに初めて行う。一度計算した結果は保存し、後のタスクも使う。',
			href: '/learn/kernel/database#get',
		},
		{
			functionName: 'TaskOutput',
			label: 'コンパイル、整形、コード検査の結果を保存する',
			what: 'コンパイルは言語プラグインが決めた形式のファイルを、整形は書き直したソースを、コード検査はエラーや警告を返す。出力は TaskOutput に入れ、構文木や解析結果とは別に持つ。',
			href: '/learn/kernel/emitter',
		},
		{
			functionName: 'FinishTask::prepare',
			label: '型検査に渡すデータを文書ごとに作る',
			what: '型検査も選んでいれば、FinishTask（全文書の後に一度だけ動くタスク）の prepare が、同じ保存領域から型検査用のコードと位置情報を求める。TypeScript で型検査するプラグインは、元の構文木から検査用のコードを作る。prepare はその文字列、元のソースへの位置の対応表、型宣言の設定、元のソースのコピーを Part にまとめる。コンパイル済みの JavaScript は使わない。',
			href: '/learn/kernel/pipeline#tasks',
		},
		{
			functionName: 'FinishTask::finish',
			label: '文書ごとのデータを集めて型検査する',
			what: '全文書の処理が終わると、finish が Part をタスクごとに集め、TypeScript のコンパイラで型を調べる。指摘の位置を元のソースの位置に戻し、各文書の TaskOutput に加える。文書ごとの保存領域は、この時点でもう解放されている。',
			href: '/learn/kernel/pipeline#project',
		},
		{
			functionName: 'sink',
			label: '結果が揃った文書を呼び出し側に渡す',
			what: 'sink は、呼び出し側が渡す、結果を受け取る関数。Part を返さなかった文書は処理の直後に、返した文書は finish の後に sink へ渡す。呼び出し側は TaskOutput のファイルと診断を受け取る。',
			href: '/learn/kernel/pipeline#run-each',
		},
	];
	const structures = [
		{
			name: 'Document',
			content: 'ファイルのパスと元のソース文字列。言語も構文木も持たない。',
			lifetime: '文書の処理中。文書ごとの保存領域から参照する。',
		},
		{
			name: '構文木（言語ごとの型）',
			content:
				'言語プラグインがソースから作る木と、空白やコメントを含むトークン。埋め込まれた言語があれば、その構文木も持つ。',
			lifetime: '初めて求められたときに作り、文書ごとの保存領域で持つ。',
		},
		{
			name: '解析結果の表（言語ごとの型）',
			content:
				'変数がどの宣言を指すかなどの解析結果。ノードや束縛の識別番号で引く別の表に持ち、構文木は書き換えない。',
			lifetime: '必要なものだけ作り、文書ごとの保存領域で持つ。',
		},
		{
			name: 'コンパイル用に整理した構文木（言語ごとの型）',
			content: '出力先の処理に合わせて組み直した木。構文木とは別に作り、元の構文との対応も持つ。',
			lifetime: '求められたときに作り、文書ごとの保存領域で持つ。',
		},
		{
			name: 'TaskOutput',
			content: '生成したファイルの名前と文字列、エラーや警告。構文木や解析結果とは別に持つ。',
			lifetime: '文書の処理が終わっても残し、結果が揃ったら sink に渡す。',
		},
		{
			name: 'Part（型検査の場合）',
			content:
				'型検査用の TypeScript、元のソースへの位置の対応表、型宣言の設定、元のソースのコピー。構文木への参照は持たない。',
			lifetime: 'prepare で作り、全文書の処理が終わると finish が受け取る。',
		},
	];
</script>

<svelte:head><title>{c.title} — rsvelte 開発者向けの教材</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="カーネルは、どの言語でも使う機能をまとめた Rust ライブラリです。処理の実行、計算結果の保存、位置の変換、エラーや警告の型を持ちます。構文解析やコンパイルなど言語ごとの処理は、言語プラグインが登録します。"
/>

<div class="prose-learn">
	<H2 id="why" />
	<p>
		同じソースにコンパイル、整形、コード検査、型検査を選んだとします。処理ごとに構文解析をすると、同じ計算を繰り返します。構文木や解析結果を処理の間で共有すれば、計算は一度で済みます。
	</p>
	<p>
		言語が違っても共通にできる部分があります。ソースの位置を行と列に直す仕組み、計算結果を保存する仕組み、エラーや警告の報告、出力文字列の組み立て、生成したコードの位置を元のソースに対応させる処理です。構文木の形やスコープの規則は言語ごとに違うので、言語プラグインが決めます。rsvelte
		は共通の部分を一つの Rust ライブラリにまとめました。それがカーネルです。
	</p>
	<p>
		置き場所は、言語を知っているか、どの処理でも使うか、の二つで決めます。言語を知っているものは、言語プラグインの
		crate
		に置きます。言語を知らず、どの処理でも使うものはカーネルに置きます。スケジューラ、計算結果のキャッシュ、元のソースの位置を求める処理、エラーや警告の型がそうです。
	</p>
	<p>
		言語を知らず、一部の処理だけが使うものは、カーネルの隣の crate
		に置きます。コード検査のルールの走らせ方と並び順は rsvelte_lint_runner
		にあります。整形の文書プリンタは rsvelte_document_printer
		にあります。これらは、必要なタスクだけが使う部品です。カーネルの隣には rsvelte_plugin_interface
		もあります。ホスト（コマンドラインとブラウザ）がプラグインを組み込むための口です。どのタスクも、カーネルとこの口があれば書けます。
	</p>

	<H2 id="overview" />
	<p>次の図は、言語プラグイン、カーネル、ホストが何を登録し、どの順にデータを渡すかを示します。</p>
</div>

<KernelOverview />

<div class="prose-learn">
	<H2 id="layers" />
	<p>依存は一方向で、右へ行くほど言語から遠くなります。</p>
</div>

<Figure label="図 1.2 · crate の役割と依存の向き">
	<div class="overflow-x-auto px-4 py-5">
		<ol class="flex min-w-[640px] items-stretch gap-2 font-mono text-[12.5px] tracking-normal">
			{#each [['rsvelte_command_line · rsvelte_kernel_browser', 'ホスト：コマンドラインとブラウザ'], ['rsvelte_svelte_compile · rsvelte_vue_lint · rsvelte_svue ほか', '言語の機能：コンパイル、整形、コード検査、型検査、言語間の変換'], ['rsvelte_svelte · rsvelte_vue ほか／rsvelte_plugin_interface ほか', '言語の中核と、言語を知らない部品'], ['rsvelte_kernel', '言語を知らない']] as [name, role], i (name)}
				<li class="flex flex-1 items-center gap-2">
					<div
						class={[
							'flex-1 rounded-sm border px-3 py-2',
							i === 3 ? 'border-fg bg-surface' : 'border-line-strong',
						]}
					>
						<div class="font-medium text-fg">{name}</div>
						<div class="mt-0.5 text-[11.5px] text-muted">{role}</div>
					</div>
					{#if i < 3}<span class="text-muted" aria-hidden="true">→</span>{/if}
				</li>
			{/each}
		</ol>
	</div>
	{#snippet caption()}矢印は依存の向き。役割は crate のパスで決まり、<code>tools/structure</code>
		のテストが依存の向きを確かめる。言語の中核はカーネルと他の言語の中核だけに、言語を知らない部品はカーネルだけに依存する。設定ファイルを読む
		rsvelte_configuration_loading には、ホストだけが依存できる。rsvelte_svue と rsvelte_svelte_compile_vapor
		は Svelte と Vue の両方の中核に依存する。カーネルが依存する外部の crate は rayon、semver、rustc-hash、sha2
		の四つ。{/snippet}
</Figure>

<div class="prose-learn">
	<p>
		カーネルの <code>lib.rs</code>
		は、冒頭のコメントでカーネルが持つものを挙げています（訳：共有するソースのデータ、計算結果、診断、出力、性能の計測）。
	</p>
	<blockquote class="border-l-0 font-mono text-[14px] leading-[1.7] text-fg-2">
		{data.libDocs}
	</blockquote>
	<p>
		プラグインは、計算結果の型やタスクを <code>Registry</code
		>（登録を受け取る型）に登録します。何を登録するかは言語ごとに決めます。次の Svelte プラグインの
		<code>register</code>
		は、構文木や名前解決などの計算結果を登録します。コンパイルや整形などのタスクは、それぞれの機能の crate
		が登録します。
	</p>
</div>

<Code item={data.code.register} />

<div class="prose-learn">
	<p>
		<code>Registry</code>
		は、タスク、全文書をまとめるタスク、計算結果、共通の呼び出し窓口、プラグインの宣言を持ちます。共通の呼び出し窓口は、型検査のように言語ごとに答え方が違う問いを、一つのタスクから尋ねる仕組みです（<a
			href="/learn/kernel/database#facet">04 章</a
		>）。
	</p>
</div>

<Code item={data.code.registry} />

<div class="prose-learn">
	<H2 id="modules" />
</div>

<Figure label="図 1.3 · 言語に共通する実行の流れ">
	<ol class="grid gap-3 p-5 sm:grid-cols-3">
		<li>
			<strong>1. 文書を作る</strong>
			<p>ホストがパスとソースを渡す。</p>
		</li>
		<li>
			<strong>2. タスクを実行する</strong>
			<p>言語プラグインが必要な計算結果を求め、文書ごとに再利用する。</p>
		</li>
		<li>
			<strong>3. 出力を返す</strong>
			<p>生成したファイルと診断を呼び出し側へ渡す。</p>
		</li>
	</ol>
	{#snippet caption()}型検査のように他の文書も必要な処理は、全文書のデータを準備してからまとめて実行する。構文木の型や出力の形式は言語プラグインが決める。{/snippet}
</Figure>

<div class="prose-learn">
	<p>
		カーネルの「処理の登録と実行」が、選んだ処理を文書ごとに順に呼びます。「計算結果の保存と再利用」は、言語プラグインが作る構文木や名前解決の表を持ちます。整形は
		rsvelte_document_printer の文書プリンタを使います。コード検査は、rsvelte_lint_runner
		のルールの実行と指摘の書き出しを使います。どちらもカーネルから、エラーや警告の型と位置の変換を使います。コンパイルと型検査用のコードの生成は、文字列の出力と位置の対応付けを使います。
	</p>
</div>

<details class="my-8">
	<summary class="cursor-pointer text-[14px] font-medium text-fg-2"
		>カーネルのモジュールと実装ファイルを見る</summary
	>
	<KernelModuleFigure modules={data.modules} />
</details>

<div class="prose-learn">
	<p>
		実装は {data.modules.length} 個のモジュールに分かれています<Note>
			<code>lib.rs</code> は <code>pub mod</code> と再エクスポートだけなので数えていません。</Note
		>。上の「カーネルのモジュールと実装ファイルを見る」を開くと、役割ごとの一覧が見られます。各グループの「実装ファイルと行数」に、ファイルごとの説明と行数があります。行数はテストを含み、ビルドのたびに数え直します。
	</p>

	<H2 id="life" />
	<p>
		一つの文書にコンパイル、整形、コード検査、型検査を選んだ場合を追います。構文木と解析結果の型はプラグインが決めます。計算結果は
		<code>DocumentContext</code>（文書ごとの保存領域）に、計算結果の型ごとに分けて置きます。<code
			>Part</code
		>
		は型検査用のデータです。各文書で準備し、全文書の処理が終わってから渡します。表の
		<code>Part</code>
		の行は、TypeScript で型検査する場合の例です。
	</p>
	<table class="table">
		<thead><tr><th>データ</th><th>中身</th><th>いつ持つか</th></tr></thead>
		<tbody>
			{#each structures as structure (structure.name)}
				<tr
					><td><code>{structure.name}</code></td><td>{structure.content}</td><td
						>{structure.lifetime}</td
					></tr
				>
			{/each}
		</tbody>
	</table>
	<p>
		解析結果の表は、たとえば「この識別子の番号 →
		参照先の宣言」という対応表です。木に解析用の印を書き込まず、別の表に保存します。コンパイル用に整理した構文木は対応表ではなく、構文木から作る別の木です。
	</p>
	<p>
		実行の流れは次のとおりです。<code>Task::run</code> の中から <code>DocumentContext::get</code>
		を呼ぶので、木や表はタスクが必要とした時点で計算します。全タスクの前に全解析を済ませるわけではありません。
	</p>
</div>

<ol class="my-8 border-l border-line-strong">
	{#each life as step, i (step.functionName)}
		<li class="relative pb-5 pl-6 last:pb-0">
			<span
				class="absolute top-[0.55em] -left-[4.5px] h-2 w-2 rounded-[1px] bg-fg"
				aria-hidden="true"
			></span>
			<div class="flex flex-wrap items-baseline gap-x-3">
				<span class="font-mono text-[12px] tracking-normal text-muted">{i + 1}</span>
				<a
					href={step.href}
					title="コード上の名前：{step.functionName}"
					class="text-[14px] hover:text-accent">{step.label}</a
				>
			</div>
			<p class="mt-1 text-[15.5px] leading-[1.75] text-fg-2">{step.what}</p>
		</li>
	{/each}
</ol>

<div class="prose-learn">
	<p>
		今の実装では、文書のコンパイル、整形、コード検査が先に走り、その後で型検査の <code>prepare</code
		>
		が走ります。コンパイルも選んでいれば、この時点で JavaScript とスタイルシートはできています。今のコンパイルは、プロジェクト全体の型検査の結果を入力にしていません。
	</p>
	<p>
		コンパイルだけを選ぶと、型検査の <code>prepare</code> と <code>finish</code>
		は走りません。型検査だけなら、コンパイルの出力は作らず、構文解析と TypeScript の生成から始めます。今の実装には、他のファイルの情報を使ってコンパイルする段階はありません。入れるなら、その情報を揃えてからコンパイルする段階が別に要ります。
	</p>
</div>

<Code
	item={data.code.runDocument}
	mark={['shared.get_or_init(|| DocumentContext::new', 'catch_unwind', 'own = isolated()']}
/>

<div class="prose-learn">
	<p>
		<code>run_document</code> は、共有の方法を引数で受け取ります。共有する（<code
			>Sharing::Shared</code
		>）か、タスクごとに計算する（<code>Sharing::Isolated</code
		>）かです。共有する場合は、すべてのタスクが同じ
		<code>shared</code> を使います。同じパース結果は、文書ごとに一回だけ計算します。<code
			>Sharing::Isolated</code
		>
		では、タスクが変わるたびに新しい <code>DocumentContext</code>
		を作ります。これは製品用ではなく、共有の効果を測るためのベンチマークの測定条件です。<code
			>shared</code
		>
		は初めて求められたときに作ります。<code>Sharing::Isolated</code> では一度も求めないので、作られません。
	</p>

	<DeepDive title="なぜ文書ごとに並列化するのか">
		<p>
			並列化の単位を文書にすると、一つの文書の計算は一つのワーカーの上で完結します。<code
				>DocumentContext</code
			>
			は同期のためのロックを持たず（<code>!Sync</code>）、計算結果は <code>OnceCell</code> に入れるだけで済みます。
		</p>
		<p>
			タスクを続けて走らせるので、パース結果がまだキャッシュに残っているうちに、コンパイル、整形、コード検査が同じ木を読みます。その代わり、一つの巨大な文書を複数のコアで処理できません。検証用のソースファイル集（公式ツールの出力と比べる、実在する
			Svelte ファイルの集まり）の文書は小さいので、今はこの割り切りが合っています。
		</p>
	</DeepDive>

	<H2 id="languages" />
	<p>
		カーネルが本当に言語を知らないかは、二つ目の言語を足すまで分かりません。<code>rsvelte_vue</code>
		は、それを試すために足した、Vue の単一ファイルコンポーネントのプラグインです。Svelte と同じ仕組みで、次の計算結果を文書ごとに保存します。
	</p>
	<table class="table">
		<caption class="mb-3 text-left text-[14px] text-fg-2">Vue プラグインが保存する計算結果</caption>
		<thead><tr><th scope="col">役割</th><th scope="col">保存するもの</th></tr></thead>
		<tbody>
			<tr
				><th scope="row">構文解析（<code>Parsed</code>）</th><td
					>スクリプト、テンプレート、スタイルの構文木。構文解析に失敗したときは、そのエラー。</td
				></tr
			>
			<tr
				><th scope="row">コンパイル用に整理した構文木（<code>Lowered</code>）</th><td
					>Vue のコンパイラが扱う構造に変換したテンプレート。</td
				></tr
			>
			<tr
				><th scope="row">名前解決（<code>Resolved</code>）</th><td
					>変数の宣言と参照の対応と、スクリプトの各束縛の種類。</td
				></tr
			>
		</tbody>
	</table>
	<p>Vue プラグインの登録も、Svelte と同じ形です。</p>
</div>

<Code item={data.code.vueRegister} />
<Code item={data.code.vueParsed} />

<div class="prose-learn">
	<p>
		Vue
		プラグインには、コンパイル、整形、コード検査、型検査の四つの処理があります。出力は、コンパイルを
		Vue の公式プラグインに、整形を Prettier に、コード検査を ESLint
		に合わせています。型検査には、vue-tsc と同じ形のコードを生成します。JavaScript
		の構文解析と出力、スタイルシートの処理は Svelte と共通です。
	</p>
	<p>
		二つ目の言語のために足したものは次の四つです。最初の一つは rsvelte_typescript
		に、残りはカーネルに足しました。どれも Vue だけのものではなく、Svelte も使います。
	</p>
	<ul>
		<li>
			埋め込む側の言語が開くスコープ：スクリプトを埋め込む側の言語（Vue
			のテンプレートなど）は、スコープの根を渡せます。スコープ解析（<code>rsvelte_typescript</code
			>）は、それを木として受け取ります。Vue の <code>v-for</code> は、テンプレートが開くスコープです。
		</li>
		<li>
			終端のない診断：ESLint の報告には位置が一点だけのものがあり、コード検査の書き出しはその終端を <code
				>null</code
			> と書きます。
		</li>
		<li>
			256 ビットのハッシュ関数：カーネルの <code>sha256</code> で、Vue のスタイルの識別子を公式のプラグインと同じ値にします。
		</li>
		<li>
			共通の呼び出し窓口：型検査のように、言語ごとに答え方が違う問いを一つのタスクから尋ねる仕組みです（<a
				href="/learn/kernel/database#facet">04 章</a
			>）。
		</li>
	</ul>
	<p>
		二つのプラグインを組み合わせて、一方の言語のコンポーネントをもう一方のランタイムで動かす翻訳もあります。svue（<code
			>rsvelte_svue</code
		>）は、<code>.vue</code> のコンポーネントを Svelte のコンパイラでコンパイルし、Svelte
		のランタイムで動かします。意味は Vue のままです。Vue のパーサと名前解決、Svelte
		のコンパイラはそのまま使います。自分で持つのは、Vue の構文木を Svelte の runes
		のスクリプトと、コンパイル用に整理した構文木へ翻訳する部分だけです（<a
			href="/learn/kernel/layers#svue">05 章</a
		>）。
	</p>
	<p>
		vuelte（<code>rsvelte_svelte_compile_vapor</code>）は逆向きです。<code>.svelte</code>
		のコンポーネントを、Vue Vapor 向けにコンパイルします。Vue Vapor は、仮想 DOM を使わない Vue のランタイムです。意味は
		Svelte のままです（<a href="/learn/kernel/layers#vuelte">05 章</a>）。
	</p>
	<p>crate の大きさ（<code>src/</code> の Rust の行数。数え方はモジュールの行数と同じ）：</p>
</div>

<figure class="my-8 overflow-x-auto">
	<table class="table">
		<thead><tr><th>crate</th><th class="num">ファイル</th><th class="num">行</th></tr></thead>
		<tbody>
			{#each data.crates as cr (cr.name)}
				<tr
					><td><code>{cr.name}</code></td><td class="num">{cr.files}</td><td class="num"
						>{cr.lines.toLocaleString('en-US')}</td
					></tr
				>
			{/each}
		</tbody>
	</table>
</figure>

<div class="prose-learn">
	<H2 id="promises" />
	<p>カーネルのコードは、次の四つの約束を守ります。</p>
	<ol>
		<li>
			未対応の構文を近似しません。移植していない構文に出会ったタスクは、<code>Unsupported</code>
			を報告し、ファイルを書きません。近似した出力は、公式ツールの出力との一致率に、偶然合った出力を混ぜるからです（<a
				href="/learn/kernel/diagnostics#unsupported">07 章</a
			>）。
		</li>
		<li>
			位置は <code>u32</code> で持ちます。<code>Span</code> は 8
			バイトで、ファイルの識別番号を持ちません。その <code>Span</code>
			を持つ構文木や診断が、どの文書のものかで分かるからです（<a href="/learn/kernel/source#span"
				>02 章</a
			>）。
		</li>
		<li>
			一度だけ計算します。タスクはパーサを直接呼ばず、計算結果を求めます（<a
				href="/learn/kernel/database">04 章</a
			>）。
		</li>
		<li>
			計測を最初から組み込みます。計算結果、タスク、ルールは、どれも名前のついた計測の単位（フェーズ）です。<code
				>metrics</code
			>
			feature を外すと、計測のコードはまったく残りません（<a href="/learn/kernel/measurement"
				>12 章</a
			>）。
		</li>
	</ol>
</div>

<ChapterFooter chapter={c} />
