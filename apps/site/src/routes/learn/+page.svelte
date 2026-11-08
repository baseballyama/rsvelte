<script lang="ts">
	import ChapterFooter from '#lib/components/ChapterFooter.svelte';
	import ChapterHeader from '#lib/components/ChapterHeader.svelte';
	import H2 from '#lib/components/H2.svelte';
	import Note from '#lib/components/Note.svelte';
	import { appendix, chapter, chapters } from '#lib/site.ts';

	let { data } = $props();
	const c = chapter('intro');
</script>

<svelte:head><title>開発者向けの教材 — rsvelte</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="rsvelte のカーネル rsvelte_kernel を、全体の形から一行ずつの実装まで読む教材です。"
/>

<div class="prose-learn">
	<H2 id="audience" />
	<p>
		rsvelte でファイルを処理したいだけなら、<a href="/guide">使い方ガイド</a>から始めてください。
	</p>
	<p>
		この教材は、カーネルを変更する人向けです。Rust
		が読めることを前提にします。カーネルは、次の処理を実行する仕組みと、各言語が使う共通の部品を提供します。
	</p>
	<ul>
		<li>構文解析：ソースから構文木を作る。</li>
		<li>整形：空白や改行を整える。</li>
		<li>コード検査：問題を指摘する。</li>
		<li>コンパイル：出力先の言語に変換する。</li>
		<li>型検査：値や操作の型が合うかを調べる。</li>
	</ul>
	<p>
		Svelte と Vue
		は、言語プラグインの実装例として登場します。各言語の知識は、必要なところで説明します。
	</p>
	<p>
		カーネルは {data.kernelFiles} ファイル、テストを含めて {data.kernelLines.toLocaleString(
			'en-US',
		)} 行です<Note
			>ビルドのたびに <code>crates/language_independent/kernel/src</code> を数え直した値です。</Note
		>。コードからは「なぜそう書いたか」と「どこが弱いか」が読み取れません。この教材はその二つを書き足します。
	</p>

	<H2 id="honesty" />
	<p>この教材の図とコードは、次のどれかです。それぞれの場所に、どれかを書いています。</p>
	<ul>
		<li>
			本物のコード：灰色の枠の Rust の抜粋です。サイトのビルド時に <code>crates/</code>
			から項目名で切り出します。行番号はファイルのもので、右上のリンクはそのコミットの該当行を開きます。項目の名前が変わるとビルドが失敗するので、古い抜粋は残りません。
		</li>
		<li>
			ブラウザで動くアルゴリズム：文書プリンタは、整形で改行と字下げを決める部品です。Rust の <code
				>rsvelte_document_printer</code
			>
			を WebAssembly にして動かします。プリンタ本体と文字幅の計算は、ネイティブ版と同じです。
		</li>
		<li>
			TypeScript への移植：次の四つは、Rust のコードを TypeScript に一行ずつ移植し、Rust
			のテストと同じ入力と期待値で検査しています。
			<ul>
				<li><code>LineIndex</code>：バイト位置を行と列に変換する（02 章）。</li>
				<li><code>Interner</code>：名前を保存して共有する（03 章）。</li>
				<li><code>Emitter</code>：生成したコードと元のソースの位置を対応させる（10 章）。</li>
				<li><code>StructuredDataWriter</code>：JSON などを直接書き出す（11 章）。</li>
			</ul>
			<p>
				TypeScript 版の <code>Interner</code> だけは、Rust 版（FxHash）と違うハッシュ関数を使います。そのため、名前が入る表の位置は
				Rust と一致しません。
			</p>
		</li>
		<li>
			モデル：スケジューラ（処理を並列に実行する部分）の時間軸、キャッシュ、バッファプール（作業用メモリを使い回す仕組み）の図は、カーネルの規則をまねた模型です。図の時間やメモリの数字は例で、実測ではありません。
		</li>
	</ul>
	<p>
		実測は <a href="/learn/measure">14 章「実測」</a
		>にあります。性能の基準値との比較検査は、割り当て回数や命令数を基準値と比べます。その数は、ビルド時に
		<code>tools/performance/baseline.json</code>
		から読みます。実行時間のベンチマークには、測ったビルドを添えます。本文の変更前後の数は、その変更のコミットメッセージからの引用です。コミットは、識別子の先頭
		10 文字（<code>a5822ee26f</code> など）で示します。
	</p>

	<H2 id="path" />
	<p>
		最初に <a href="/learn/kernel">01 章「カーネルの全体像」</a
		>を読んでください。その後は好きな順番でかまいません。中心の仕組みは、位置（02
		章）、一度だけ計算する仕組み（04 章）、スケジューラ（06
		章）の三つです。残りの章は、その上に載る部品です。
	</p>
	<p>
		各章で触れた弱点と、それをどう直したかは、最後の <a href="/learn/polish">15 章「磨きどころ」</a
		>にまとめています。独自の処理を追加する手順は
		<a href="/learn/plugins">16 章「プラグインを実装する」</a>にあります。
	</p>
</div>

<ol class="mt-10 border-t border-line">
	{#each chapters.slice(1) as ch (ch.slug)}
		<li class="border-b border-line">
			<a
				href={ch.href}
				class="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-x-3 py-3"
			>
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
			<a
				href={a.href}
				class="group grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-3 py-3"
			>
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
