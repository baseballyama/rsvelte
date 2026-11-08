<script lang="ts">
	import ChapterFooter from '#lib/components/ChapterFooter.svelte';
	import ChapterHeader from '#lib/components/ChapterHeader.svelte';
	import Code from '#lib/components/Code.svelte';
	import H2 from '#lib/components/H2.svelte';
	import Note from '#lib/components/Note.svelte';
	import { chapter } from '#lib/site.ts';
	import JsonStepper from '#lib/widgets/JsonStepper.svelte';

	let { data } = $props();
	const c = chapter('json');
</script>

<svelte:head><title>{c.title} — rsvelte 開発者向けの教材</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="コード検査の結果、型検査の結果、ベンチマークのレポートは JSON で書きます。カーネルの StructuredDataWriter（JSON を書き出す型）は、値の木を作らずに文字列へ直接書きます。"
/>

<div class="prose-learn">
	<H2 id="state" />
	<p>
		<code>serde_json::Value</code>
		のような値の木を作ると、オブジェクトのキーごとに文字列を確保します。出力は一度書けば終わりなので、木は要りません<Note
			>rsvelte の以前の実装（main ブランチ）は、構文木を汎用の JSON
			値として保存します。そこでは、オブジェクトのキー用の文字列の確保が、メモリ割り当ての大部分を占めていました。</Note
		>。<code>StructuredDataWriter</code>
		は、呼ばれた順に文字列へ追記するだけです。書いている途中で変わる状態は、次の二つです（<code
			>pretty</code
		> は字下げするかどうかの設定で、途中では変わりません）。
	</p>
	<ul>
		<li>
			<code>stack</code>：開いているオブジェクトや配列ごとに、要素をもう書いたかを覚えるフラグ。
		</li>
		<li><code>after_key</code>：直前にキーを書いたので、次の値はそのキーに属するという印。</li>
	</ul>
</div>

<Code item={data.code.writer} />

<div class="prose-learn">
	<p>
		値を書く前には必ず <code>before_value</code> を通ります。キーの直後なら何もしません。それ以外で、同じ入れ物にもう要素があればカンマを書きます。pretty
		なら、さらに改行してタブで字下げします。
	</p>
</div>

<Code item={data.code.beforeValue} />

<JsonStepper />

<div class="prose-learn">
	<p>
		閉じるときは、要素を一つでも書いていれば、改行してから閉じ括弧を書きます。空の <code
			>{'{}'}</code
		>
		や <code>[]</code> は一行のままです。
	</p>
</div>

<Code item={data.code.close} />
<Code item={data.code.key} />

<div class="prose-learn">
	<p>
		数値を書く関数は二つです。<code>write_number</code> は整数（<code>Integer</code>
		トレイトを実装した型）だけを受け取ります。小数は
		<code>fixed</code> で、小数点以下の桁数を指定して書きます。JSON には <code>NaN</code>
		も無限大もないので、有限でない値は <code>null</code> になります。
	</p>
	<p>
		以前の数値の関数は、<code>Display</code>
		を実装した値なら何でも受け取りました。そのため、文字列も <code>NaN</code>
		も数値の位置に書けました。実際にベンチマークは、<code>format!("{'{:.3}'}", …)</code>
		で丸めた文字列を渡し、集計する値が一つもないときは <code>NaN</code> を書いていました。整数と小数で関数を分けたので、どちらも書けなくなりました。
	</p>
</div>

<Code item={data.code.integer} />
<Code item={data.code.num} />
<Code item={data.code.fixed} />

<div class="prose-learn">
	<H2 id="escape" />
	<p>
		文字列は <code>write_string</code> でエスケープします。<code>"</code>、<code>\</code
		>、改行、復帰、タブは短い形に、ほかの制御文字は
		<code>\u00XX</code> にします。U+2028 と U+2029 は JSON では正しい文字なので、そのまま書きます。ただし、古い
		JavaScript の文字列リテラルに埋め込むと構文エラーになるので、出力をそのまま埋め込めません。
	</p>
	<p>
		エスケープの要らない部分は、次にエスケープする位置までまとめてコピーします。エスケープが要るバイトはすべて
		ASCII なので、区切りは必ず文字の境目に来ます。ベンチマークの 1
		ラウンドの命令数は、一文字ずつ書いていたころの 2,767,320,163 から 2,749,769,496
		に減りました（−0.6%）。1 ラウンドは、全ファイルを一回処理する測定です（<a href="/learn/measure"
			>14 章</a
		>）。テスト用の入力と期待値に対する出力は変わりませんでした。
	</p>
</div>

<Code item={data.code.writeString} />

<div class="prose-learn">
	<p>
		テストには、一文字ずつ書く元の定義（<code>by_char</code>）を残してあります。ASCII
		のすべての文字と、エスケープと多バイト文字が混ざった文字列で、二つの出力が一致することを確かめます。
	</p>
</div>

<Code item={data.code.escapeTest} />
<Code item={data.code.test} />

<ChapterFooter chapter={c} />
