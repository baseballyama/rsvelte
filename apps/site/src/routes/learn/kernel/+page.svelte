<script lang="ts">
	import Term from '$lib/components/Term.svelte';
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import DeepDive from '$lib/components/DeepDive.svelte';
	import Figure from '$lib/components/Figure.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';

	let { data } = $props();
	const c = chapter('kernel');

	const life = [
		{ functionName: 'Registry::document', label: '元のソースを持つ文書を作る', what: 'Document にパスとソース文字列を保存し、サイズの上限を確かめる。この時点では構文木も解析結果もない。', href: '/learn/kernel/pipeline#document' },
		{ functionName: 'run_each', label: '選ばれたタスクを文書ごとに実行する', what: 'タスクの識別番号で実行候補を選び、文書を rayon のワーカーに配る。各タスクはパスや内容から処理対象かを判断する。', href: '/learn/kernel/pipeline#run-each' },
		{ functionName: 'run_document', label: '文書ごとの保存領域を用意する', what: '最初のタスクを実行するときに DocumentContext を作る。元の文書を参照し、計算結果を保存する場所を用意する。この時点では構文解析はしない。', href: '/learn/kernel/pipeline#run-document' },
		{ functionName: 'Task::run / DocumentContext::get', label: '必要になった木と解析結果を作る', what: '各タスクは DocumentContext::get で必要な計算結果を求める。構文解析、名前解決、コンパイル用の木の作成、式や要素の解析を、必要になったときに行う。一度計算した結果は保存し、後のタスクでも再利用する。', href: '/learn/kernel/database#get' },
		{ functionName: 'TaskOutput', label: 'compile・format・lint の結果を保存する', what: 'コンパイルは JavaScript とスタイルシートの文字列を作る。整形は書き直したソースを、コード検査はエラーや警告を返す。出力は TaskOutput に入れ、元の構文木や解析結果とは別に保持する。', href: '/learn/kernel/emitter' },
		{ functionName: 'FinishTask::prepare', label: '型検査に渡す文書ごとのデータを作る', what: '型検査も選ばれていれば、同じ文書ごとの保存領域から 型検査用のコードと位置情報 を求める。Svelte のプラグインは元の構文木から型検査用の TypeScript を作る。prepare はその文字列、元ソースへの位置対応表、型宣言の設定、元ソースのコピーを Part にまとめる。コンパイル済みの JavaScript は使わない。', href: '/learn/kernel/pipeline#tasks' },
		{ functionName: 'FinishTask::finish', label: '文書ごとのデータを集めて型検査する', what: '全文書の処理後に Part をタスクごとに集め、TypeScript のコンパイラで型を調べる。指摘の位置を元のソース上の位置に戻し、各文書の TaskOutput に加える。文書ごとの保存領域は、この時点で解放されている。', href: '/learn/kernel/pipeline#project' },
		{ functionName: 'sink', label: '結果が揃った文書を呼び出し側に渡す', what: 'Part を返さなかった文書は文書処理の直後に、返した文書は finish の後に sink へ渡す。呼び出し側は TaskOutput のファイルや診断を受け取る。', href: '/learn/kernel/pipeline#run-each' }
	];
	const structures = [
		{ name: 'Document', content: 'ファイルのパスと元のソース文字列。言語や構文木は持たない。', lifetime: '文書の処理中。文書ごとの保存領域が参照する。' },
		{ name: 'Parsed（構文木）', content: 'テンプレート、スクリプトの JavaScript/TypeScript、スタイルの構文木と、空白・コメントを含むトークン。何が書かれているかを表す。', lifetime: '最初の要求で作り、文書ごとの保存領域のキャッシュに保持する。' },
		{ name: 'Resolved / Analyzed（解析結果の表）', content: '変数がどの束縛を指すか、式が状態を参照するか、要素を動的に更新するかなどの解析結果。ノードや束縛の識別番号で引く別の表に持ち、元の構文木を書き換えない。', lifetime: '必要になったものだけ作り、文書ごとの保存領域に保持する。' },
		{ name: 'Normalized（コンパイル用の構文木）', content: 'コンパイラ向けに組み直したテンプレートの木。構文木とは別の木で、元の構文との対応も持つ。', lifetime: '必要になったときに作り、文書ごとの保存領域に保持する。' },
		{ name: 'TaskOutput', content: '生成したファイルの名前と文字列、エラーや警告。構文木や解析の表とは別に持つ。', lifetime: '文書処理の後も保持し、結果が揃ったら sink に渡す。' },
		{ name: 'Part（型検査の場合）', content: '型検査用の TypeScript、元ソースへの位置対応表、型宣言の設定、元ソースのコピー。構文木の参照は持ち越さない。', lifetime: 'prepare で作り、全文書の処理後に finish が受け取る。' }
	];
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="カーネルは、構文解析の結果の保存や処理の実行など、各言語に共通する機能をまとめたものです。Svelte と Vue のプラグインが言語固有の処理を登録します。この章では、各モジュールの役割と、入力から出力までの手順を説明します。"
/>

<div class="prose-learn">
	<H2 id="why" />
	<p>
		Svelte のツールチェーンは、上流ではコンパイラ、Prettier プラグイン、ESLint プラグイン、svelte-check
		が別々の道具として動いています。同じコンポーネントを整形し、lint をかけ、型を調べるたびに、それぞれが自分でソースを読みます。
	</p>
	<p>
		これらの道具には、共通の処理があります。ソースの位置を行と列に直し、構文木を作って変数を参照できる範囲を調べます。
		エラーや警告の報告、出力文字列の組み立て、生成したコードの位置を元のソースに対応させる処理も共通です。
		rsvelte はこれらを一つの Rust ライブラリにまとめました。それがカーネルです。
	</p>
	<p>
		分け方の基準は一つだけです。<strong>別の言語（たとえば Vue）を足すときに書き直すものか。</strong>書き直さないもの、つまりスケジューラ、計算結果のキャッシュ、ルールの走らせ方、元のソース位置を求める処理、文書プリンタはカーネルに置きます。
	</p>
	<p>
		この基準は、実際に二つ目の言語を足して試されています（<a href="#languages">二つ目の言語</a>）。
	</p>

	<H2 id="layers" />
	<p>依存は一方向で、下に行くほど言語から遠くなります。</p>
</div>

<Figure label="図 1.1 · 層">
	<div class="overflow-x-auto px-4 py-5">
		<ol class="flex min-w-[640px] items-stretch gap-2 font-mono text-[12.5px] tracking-normal">
			{#each [['rsvelte_command_line', 'ホスト: 引数、読み込み、書き出し'], ['rsvelte_svelte · rsvelte_vue · rsvelte_svue', '言語プラグイン'], ['rsvelte_typescript · rsvelte_stylesheet · rsvelte_markup', '埋め込み言語と共有の判断'], ['rsvelte_kernel', '言語を知らない']] as [name, role], i (name)}
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
	{#snippet caption()}矢印は依存の向き。rsvelte_svue は rsvelte_svelte と rsvelte_vue の両方に依存する。カーネルは rayon と rustc-hash 以外に依存しない。{/snippet}
</Figure>

<div class="prose-learn">
	<p>
		カーネルの <code>lib.rs</code> は、冒頭のコメントでこの約束を書いています。
	</p>
	<blockquote class="border-l-0 font-mono text-[14px] leading-[1.7] text-fg-2">{data.libDocs}</blockquote>
	<p>
		プラグインの側から見ると、カーネルとの接点は登録だけです。Svelte プラグインの <code>register</code>
		は、計算結果の型を五つ登録します。<code>tasks::register</code> は、タスクを四つ、プロジェクト全体の処理を一つ登録します。言語ごとの処理を呼ぶ共通窓口も登録します。計算結果のうち三つは、構文木に解析結果を加えたものです（<a
			href="/learn/kernel/layers">05</a
		>）。
	</p>
</div>

<Code item={data.code.register} />

<div class="prose-learn">
	<p>登録を受け取る <code>Registry</code> は、タスク・プロジェクトタスクと、計算結果・共通の呼び出し窓口の登録を持ちます。</p>
</div>

<Code item={data.code.registry} />

<div class="prose-learn">
	<H2 id="modules" />
	<p>
		カーネルは {data.modules.length} のモジュールでできています<Note>
			<code>lib.rs</code> は <code>pub mod</code> と再エクスポートだけなので数えていません。</Note
		>。行数はテストを含み、ビルドのたびに数え直しています。各モジュールを、日本語の役割名と説明で示します。コードを調べるときは「実装ファイル名」を開いてください。
	</p>
</div>

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table">
		<thead><tr><th>役割</th><th class="num">行</th><th>章</th><th>何をするか</th></tr></thead>
		<tbody>
			{#each data.modules as m (m.key)}
				<tr>
					<td><span class="font-medium">{m.title}</span><div class="mt-1 text-[12px] text-muted"><code>{m.file}</code></div></td>
					<td class="num">{m.lines}</td>
					<td class="whitespace-nowrap">
						{#if m.chapter}<a class="link" href={m.chapter.href}>{m.chapter.number}</a>{/if}
					</td>
					<td class="text-[14px] text-fg-2">{m.summary}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</figure>

<div class="prose-learn">
	<p>役割でまとめると、次のグループに分かれます。</p>
	<ul>
		<li>
			ソース内の位置と名前を保存します。字句の記録には空白やコメントも含め、元の文字列を失っていないことを確認します。
		</li>
		<li>
			計算結果を保存し、必要なときに取り出します。構文木の要素と解析結果を対応させ、各処理の実行順序を決めます。
		</li>
		<li>
			出力文字列を組み立て、コードを整形し、エラーや警告を報告します。
		</li>
		<li>処理時間とメモリ使用量を計測します。作業用の保存領域を再利用し、メモリを確保する回数を減らします。</li>
		<li>
			ハッシュ値を計算します。Vue の公式プラグインは、コンポーネントのパスから計算したハッシュ値の先頭8桁を、スタイルの適用範囲の識別に使います。
		</li>
	</ul>

	<H2 id="life" />
	<p>
		一つの <code>.svelte</code> ファイルに compile・format・lint・型検査を選んだ場合を追います。
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
		解析結果の表は、たとえば「この式の識別番号→ 状態を参照するか」という対応表です。
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
		の単一ファイルコンポーネントのプラグインです。crate の冒頭のコメントがその目的を書いています。
	</p>
	<blockquote class="border-l-0 font-mono text-[14px] leading-[1.7] whitespace-pre-line text-fg-2" lang="en">{data.vueDocs}</blockquote>
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
		二つ目の言語のためにカーネルに足したものは、次のとおりです（573ac584b6、a15cdcda04）。どれも Vue に固有のものではなく、Svelte も使います。
	</p>
	<ul>
		<li>
			ホストが開くスコープ: スコープ解析（<code>rsvelte_typescript</code>）は、ホストの言語が渡す根を木として受け取ります。Vue の
			<code>v-for</code> は、テンプレートが開くスコープです。
		</li>
		<li>終端のない診断: ESLint の報告には位置が一つしかないものがあり、lint の書き出しはその終端を <code>null</code> と書きます。</li>
		<li>256ビットのハッシュ関数: 上の <code>hash</code> です。</li>
		<li>
			共通の呼び出し窓口: 型検査のように、言語ごとに答え方が違う問いを、一つのタスクから尋ねる仕組みです（<a href="/learn/kernel/database#facet">04</a
			>）。
		</li>
	</ul>
	<p>
		さらに、二つのプラグインを組み合わせて、一方の言語のコンポーネントをもう一方のランタイムで動かす翻訳もあります。<code>rsvelte_svue</code> は
		<code>.vue</code> のコンポーネントを、Vue の意味のまま Svelte のランタイム向けにコンパイルします。Vue のパーサと名前解決、Svelte
		のコンパイラはそのまま使います。自分で持つのは、Vue の構文木を Svelte の runes を使うスクリプトとコンパイル用に整理した構文木に翻訳する部分だけです。<code
			>rsvelte_vuelte</code
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
