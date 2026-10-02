<script lang="ts">
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { appendix, chapter, chapters } from '$lib/site';

	let { data } = $props();
	const c = chapter('intro');
</script>

<svelte:head><title>Learn — rsvelte</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="rsvelte のカーネル rsvelte_kernel を、大枠から一行ずつのところまで読むための教材です。コードを開く前に全体の形を頭に入れ、各章で一つのモジュールを掘り下げます。"
/>

<div class="prose-learn">
	<H2 id="audience" />
	<p>
		この教材は、カーネルに手を入れる人のために書いています。Rust が読めて、Svelte
		のツールチェーン（コンパイラ、Prettier、ESLint、svelte-check）が何をするかをおおよそ知っていることを前提にします。カーネルの上には Svelte
		のほかに Vue のプラグインも載っていて、Vue の話も出てきますが、Vue の知識は要りません。コンパイラの中身や
		Prettier のアルゴリズムは知らなくても読めます。必要なところで説明します。
	</p>
	<p>
		カーネルは {data.kernelFiles} ファイル、テストを含めて {data.kernelLines.toLocaleString('en-US')} 行と小さく<Note>この数字はビルドのたびに <code>crates/kernel/src</code> を数え直したものです。</Note>、どのファイルも一度に読み切れる長さです。それでも、コードだけでは<em
			>なぜそう書いたか</em
		>と<em>どこが弱いか</em>が見えません。この教材はその二つを補います。
	</p>

	<H2 id="honesty" />
	<p>ここにあるものは三種類に分かれます。どれがどれかは、それぞれの場所に書いてあります。</p>
	<ul>
		<li>
			<strong>本物のコード。</strong>灰色の枠で示す Rust の抜粋は、サイトのビルド時に
			<code>crates/</code> から項目名で切り出しています。行番号はファイルのもので、右上のリンクはそのコミットの該当行を指します。項目の名前が変わるとビルドが失敗するので、古い抜粋が残ることはありません。
		</li>
		<li>
			<strong>ブラウザで動くアルゴリズム。</strong>文書プリンタは Rust の <code>rsvelte_kernel</code> を WebAssembly
			にしてそのまま実行します。そのため、プリンタ本体と文字幅の計算は、ネイティブ版とブラウザ版で同一です。LineIndex、Emitter、StructuredDataWriter、Interner
			は TypeScript に一行ずつ移植してあり、Rust のテストと同じ入力・期待値で検査しています。Interner のみハッシュ関数が異なります（FxHash ではなく 別のハッシュ関数）。
		</li>
		<li>
			<strong>モデル。</strong>スケジューラの時間軸、キャッシュ、バッファプールの様子を示す図は、カーネルの規則を真似た模型です。時間やメモリの数字は例示で、実測ではありません。実測は
			<a href="/learn/measure">13 実測</a>の章にまとめています。性能の基準値との比較検査の数はビルド時に <code>tools/performance/baseline.json</code>
			から読み、実行時間のベンチマークには測ったビルドを添えています。本文中の変更前後の数は、その変更のコミット（<code>a5822ee26f</code>
			のような短い コミット識別子）のメッセージからの引用です。
		</li>
	</ul>

	<H2 id="path" />
	<p>
		最初に <a href="/learn/kernel">01 全体像</a>を読んでください。そのあとは順番どおりでなくてもかまいません。位置（02）と一度だけ計算する仕組み（04）とスケジューラ（06）が中心となる仕組みで、残りはその上に載る部品です。最後の
		<a href="/learn/polish">14 磨きどころ</a>は、各章で触れた弱点を一か所に集めたものです。
	</p>
	<p>独自の処理を追加する手順は、<a href="/learn/plugins">15 プラグインを実装する</a>で説明しています。Svelte の構文解析結果を使う例を、そのまま実行できます。</p>
</div>

<ol class="mt-10 border-t border-line">
	{#each chapters.slice(1) as ch (ch.slug)}
		<li class="border-b border-line">
			<a href={ch.href} class="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-x-3 py-3">
				<span class="font-mono text-[13px] tracking-normal text-muted">{ch.number}</span>
				<span>
					<span class="block text-[16px] group-hover:text-accent">{ch.title}</span>
					<span class="mt-0.5 block text-[14px] leading-[1.6] text-muted">{ch.abstract}</span>
				</span>
				<span class="font-mono text-[12px] tracking-normal text-muted tnum">{ch.minutes} 分</span>
			</a>
		</li>
	{/each}
	{#each appendix as a (a.href)}
		<li class="border-b border-line">
			<a href={a.href} class="group grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-3 py-3">
				<span class="font-mono text-[13px] tracking-normal text-muted">付録</span>
				<span>
					<span class="block text-[16px] group-hover:text-accent">{a.title}</span>
					<span class="mt-0.5 block text-[14px] leading-[1.6] text-muted">{a.abstract}</span>
				</span>
			</a>
		</li>
	{/each}
</ol>

<ChapterFooter chapter={c} />
