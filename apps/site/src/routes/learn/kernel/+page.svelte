<script lang="ts">
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
		{ fn: 'Registry::document', what: 'パスから言語を決め、文書を作る。サイズの上限をここで一度だけ確かめる。', href: '/learn/kernel/pipeline#document' },
		{ fn: 'run_each', what: '選ばれたタスクを決め、文書を rayon で並列に配る。', href: '/learn/kernel/pipeline#run-each' },
		{ fn: 'run_document', what: '文書ごとに Ctx を一つ作り、タスクを続けて走らせる。panic はここで止める。', href: '/learn/kernel/pipeline#run-document' },
		{ fn: 'Task::run', what: 'タスクはパーサを呼ばない。ctx.get::<Parsed>() のようにアーティファクトを、言語をまたぐタスクは ctx.facet::<F>() でファセットを求める。', href: '/learn/kernel/db#get' },
		{ fn: 'Ctx::get', what: '最初の要求で計算し、以後は同じ値を返す。計算は自分の名前のフェーズで数える。', href: '/learn/kernel/db#attribution' },
		{ fn: 'TaskOutput', what: 'タスクはファイルと診断を書く。文字列の生成は Emitter、Docs、JsonWriter が担う。', href: '/learn/kernel/emit' },
		{ fn: 'ProjectTask::prepare', what: '他の文書を必要とするタスクは、ここで持ち越す部品（Part）を返す。', href: '/learn/kernel/pipeline#project' },
		{ fn: 'sink', what: '結果が確定した文書から順に呼び出し側へ渡し、戻ったら解放する。', href: '/learn/kernel/pipeline#run-each' }
	];
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="rsv_kernel は言語を知らない核です。Svelte と Vue は言語プラグインとして自分の言語・アーティファクト・タスクを登録し、カーネルはそれを文書ごとに一度だけ計算して並列に走らせます。この章では、細部に入る前に全体の形をつかみます。"
/>

<div class="prose-learn">
	<H2 id="why" />
	<p>
		Svelte のツールチェーンは、上流ではコンパイラ、Prettier プラグイン、ESLint プラグイン、svelte-check
		が別々の道具として動いています。同じコンポーネントを整形し、lint をかけ、型を調べるたびに、それぞれが自分でソースを読みます。
	</p>
	<p>
		この四つを並べてみると、共通する部分が多いことに気づきます。どの道具もソースの位置を行と列に直し、構文木を作ってスコープを調べ、診断を出し、文字列を組み立て、ときには生成したコードの位置を元に戻します。rsvelte
		はこの共通部分を一つの crate にまとめ、言語に固有な部分をその外に出しました。それがカーネルです。
	</p>
	<p>
		分け方の基準は一つだけです。<strong>別の言語（たとえば Vue）を足すときに書き直すものか。</strong>書き直さないもの、つまりスケジューラ、アーティファクトのキャッシュ、ルールの走らせ方、写像の逆引き、文書プリンタはカーネルに置きます。
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
			{#each [['rsv_cli', 'ホスト: 引数、読み込み、書き出し'], ['rsv_svelte · rsv_vue · rsv_svue', '言語プラグイン'], ['rsv_js · rsv_css · rsv_html', '埋め込み言語と共有の判断'], ['rsv_kernel', '言語を知らない']] as [name, role], i (name)}
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
	{#snippet caption()}矢印は依存の向き。rsv_svue は rsv_svelte と rsv_vue の両方に依存する。カーネルは rayon と rustc-hash 以外に依存しない。{/snippet}
</Figure>

<div class="prose-learn">
	<p>
		カーネルの <code>lib.rs</code> は、冒頭のコメントでこの約束を書いています。
	</p>
	<blockquote class="border-l-0 font-mono text-[14px] leading-[1.7] text-fg-2">{data.libDocs}</blockquote>
	<p>
		プラグインの側から見ると、カーネルとの接点は登録だけです。Svelte プラグインの <code>register</code>
		は、言語を一つ、アーティファクトを五つ登録し、<code>tasks::register</code> の中でタスクを四つ、プロジェクトタスクを一つ、ファセットの答えを一つ登録します。アーティファクトのうち三つは、構文木の上に意味を重ねていく層です（<a
			href="/learn/kernel/layers">05</a
		>）。
	</p>
</div>

<Code item={data.code.register} />

<div class="prose-learn">
	<p>登録を受け取る <code>Registry</code> は、四つのリストを持つだけの構造体です。</p>
</div>

<Code item={data.code.registry} />

<div class="prose-learn">
	<H2 id="modules" />
	<p>
		カーネルは {data.modules.length} のモジュールでできています<Note>
			<code>lib.rs</code> は <code>pub mod</code> と再エクスポートだけなので数えていません。</Note
		>。行数はテストを含み、ビルドのたびに数え直しています。右端の列は、各ファイル冒頭の <code>//!</code>
		コメントの最初の文です。
	</p>
</div>

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table">
		<thead><tr><th>ファイル</th><th class="num">行</th><th>章</th><th>冒頭のコメント</th></tr></thead>
		<tbody>
			{#each data.modules as m (m.key)}
				<tr>
					<td><code>{m.file}</code></td>
					<td class="num">{m.lines}</td>
					<td class="whitespace-nowrap">
						{#if m.chapter}<a class="link" href={m.chapter.href}>{m.chapter.number}</a>{/if}
					</td>
					<td class="text-[14px] text-fg-2" lang="en">{m.summary}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</figure>

<div class="prose-learn">
	<p>役割でまとめると、四つのグループに分かれます。</p>
	<ul>
		<li>
			<strong>位置と名前</strong>: <code>source</code>、<code>intern</code>、<code>token</code>。どのモジュールもこれを使います。<code>token</code>
			は、表層の層がソースを何も落としていないことを確かめます。
		</li>
		<li>
			<strong>計算の骨格</strong>: <code>db</code>、<code>idx</code>、<code>pipeline</code>。何を一度だけ計算し、層ごとの事実をどこに置き、どの順に誰が走るか。
		</li>
		<li>
			<strong>出力の部品</strong>: <code>diag</code>、<code>lint</code>、<code>doc</code>、<code>emit</code>、<code>json</code>。タスクが結果を書くための道具。
		</li>
		<li><strong>計測と資源</strong>: <code>metrics</code>、<code>pool</code>。どこで時間とメモリを使ったかを数え、減らす。</li>
		<li>
			<strong>道具</strong>: <code>hash</code>。移植した道具が出力をダイジェストから作るための SHA-256 です（<code>@vitejs/plugin-vue</code>
			のスコープ ID はコンポーネントのパスの SHA-256 の先頭 8 桁）。
		</li>
	</ul>

	<H2 id="life" />
	<p>一つの <code>.svelte</code> ファイルが入力されてから結果が返るまでを、関数の順に追います。</p>
</div>

<ol class="my-8 border-l border-line-strong">
	{#each life as step, i (step.fn)}
		<li class="relative pb-5 pl-6 last:pb-0">
			<span class="absolute top-[0.55em] -left-[4.5px] h-2 w-2 rounded-[1px] bg-fg" aria-hidden="true"></span>
			<div class="flex flex-wrap items-baseline gap-x-3">
				<span class="font-mono text-[12px] tracking-normal text-muted">{i + 1}</span>
				<a href={step.href} class="font-mono text-[14px] tracking-normal hover:text-accent">{step.fn}</a>
			</div>
			<p class="mt-1 text-[15.5px] leading-[1.75] text-fg-2">{step.what}</p>
		</li>
	{/each}
</ol>

<div class="prose-learn">
	<p>
		この流れの中心は <code>run_document</code> です。文書ごとに <code>Ctx</code> を一つ作り、選ばれたタスクを順に走らせ、全体を
		<code>catch_unwind</code> で包みます。
	</p>
</div>

<Code item={data.code.runDocument} mark={['shared.get_or_init(|| Ctx::new', 'catch_unwind', 'own = isolated()']} />

<div class="prose-learn">
	<p>
		<code>Sharing::Shared</code> ではすべてのタスクが同じ <code>shared</code> を使うので、パースは文書ごとに一回で済みます。<code
			>Sharing::Isolated</code
		>
		はタスクごとに新しい <code>Ctx</code> を作ります。こちらは製品のためではなく、共有がどれだけ効くかを測るための比較用です。<code>shared</code>
		は最初に求められたときに作るので、Isolated では作られません。
	</p>

	<DeepDive title="なぜ文書ごとに並列化するのか">
		<p>
			並列化の単位を文書にすると、一つの文書に関わる計算は一つのワーカーの上で完結します。<code>Ctx</code>
			は同期のためのロックを持たず（<code>!Sync</code>）、アーティファクトは <code>OnceCell</code> に入れるだけで済みます。
		</p>
		<p>
			タスクを連続して走らせるので、パース結果がまだキャッシュに残っているうちに compile、format、lint が同じ木を読みます。代わりに、一つの巨大な文書を複数のコアで処理することはできません。コーパスの文書は小さいので、今はこの割り切りが合っています。
		</p>
	</DeepDive>

	<H2 id="languages" />
	<p>
		カーネルが本当に言語を知らないかは、二つ目の言語を足してみるまで分かりません。<code>rsv_vue</code> は、それを試すために足した Vue
		の単一ファイルコンポーネントのプラグインです。crate の冒頭のコメントがその目的を書いています。
	</p>
	<blockquote class="border-l-0 font-mono text-[14px] leading-[1.7] whitespace-pre-line text-fg-2" lang="en">{data.vueDocs}</blockquote>
	<p>Vue プラグインの登録は、Svelte と同じ形をしています。</p>
</div>

<Code item={data.code.vueRegister} />
<Code item={data.code.vueParsed} />

<div class="prose-learn">
	<p>
		Vue プラグインは、compile（<code>@vitejs/plugin-vue</code> の本番出力）、format（Prettier の HTML プリンタの移植）、lint（ESLint と
		eslint-plugin-vue）、check（vue-tsc と同じ形の射影）の四つのタスクを持ちます。JavaScript のパース、スコープ解析、中核の lint
		ルール、印字、整形、CSS は、Svelte と同じ <code>rsv_js</code> と <code>rsv_css</code> を使います。
	</p>
	<p>
		二つ目の言語のためにカーネルに足したものは、次のとおりです（573ac584b6、a15cdcda04）。どれも Vue に固有のものではなく、Svelte も使います。
	</p>
	<ul>
		<li>
			<strong>ホストが開くスコープ</strong>: スコープ解析（<code>rsv_js</code>）は、ホストの言語が渡す根を木として受け取ります。Vue の
			<code>v-for</code> は、テンプレートが開くスコープです。
		</li>
		<li><strong>終端のない診断</strong>: ESLint の報告には位置が一つしかないものがあり、lint の書き出しはその終端を <code>null</code> と書きます。</li>
		<li><strong>SHA-256</strong>: 上の <code>hash</code> です。</li>
		<li>
			<strong>ファセット</strong>: 型検査のように、言語ごとに答え方が違う問いを、一つのタスクから尋ねる仕組みです（<a href="/learn/kernel/db#facet">04</a
			>）。
		</li>
	</ul>
	<p>
		さらに、二つのプラグインを組み合わせた三つ目の言語もあります。<code>rsv_svue</code> は、Vue のテンプレート構文で書いたコンポーネントを Svelte
		の意味でコンパイルします。Vue のパーサと Svelte のコンパイラをそのまま使い、自分で持つのは Vue の木を Svelte の HIR に変換する部分だけです（<a
			href="/learn/kernel/layers#svue">05</a
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
			<strong>位置は u32 で持つ。</strong><code>Span</code> は 8 バイトで、ファイルの ID を持ちません。どの文書の位置かは、文脈から分かります（<a href="/learn/kernel/source#span">02</a>）。
		</li>
		<li>
			<strong>一度だけ計算する。</strong>タスクはパーサを直接呼ばず、アーティファクトを求めます（<a href="/learn/kernel/db">04</a>）。
		</li>
		<li>
			<strong>計測を最初から組み込む。</strong>アーティファクトとタスクとルールは、すべて名前のついたフェーズです。<code>metrics</code>
			feature を外すと、計測のコードはまったく残りません（<a href="/learn/kernel/metrics">11</a>）。
		</li>
	</ol>
</div>

<ChapterFooter chapter={c} />
