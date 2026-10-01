<script lang="ts">
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import JsonStepper from '$lib/widgets/JsonStepper.svelte';

	let { data } = $props();
	const c = chapter('json');
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="lint の結果、型検査の結果、ベンチマークのレポート。カーネルが書く 構造化データ形式は、値の木を作らずに文字列へ直接書きます。"
/>

<div class="prose-learn">
	<H2 id="state" />
	<p>
		<code>serde_json::Value</code> のような値の木を作ると、オブジェクトのキーごとに文字列を確保することになります。出力は一回書けば終わりなので、木を作る意味はありません<Note
			>main ブランチは構文木を汎用の構造化データとして保存します。その実装では、オブジェクトキー用の文字列の確保がメモリ割り当ての大部分を占めていました。</Note
		>。StructuredDataWriter は、呼ばれた順に文字列へ追記するだけです。
	</p>
	<p>状態は二つしかありません。</p>
	<ul>
		<li><code>stack</code>: 開いているオブジェクトや配列ごとに、「もう要素を一つ書いたか」を覚えるフラグ。</li>
		<li><code>after_key</code>: 直前にキーを書いたので、次の値はそのキーに属する、という印。</li>
	</ul>
</div>

<Code item={data.code.writer} />

<div class="prose-learn">
	<p>
		値を書く前には必ず <code>before_value</code> を通ります。キーの直後なら何もしません。そうでなければ、同じコンテナにすでに要素があればカンマを書き、pretty
		なら改行してタブで字下げします。
	</p>
</div>

<Code item={data.code.beforeValue} />

<JsonStepper />

<div class="prose-learn">
	<p>
		閉じるときは、要素を一つでも書いていれば改行してから閉じ括弧を書きます。空の <code>{'{}'}</code> や <code>[]</code>
		は一行のままです。
	</p>
</div>

<Code item={data.code.close} />
<Code item={data.code.key} />

<div class="prose-learn">
	<p>
		数値は二つの関数に分かれています。<code>num</code> が受け取るのは整数だけです（<code>Integer</code> トレイトを実装した型）。小数は
		<code>fixed</code> で、小数点以下の桁数を指定して書きます。構造化データ形式には <code>NaN</code> も無限大もないので、有限でない値は
		<code>null</code> になります。
	</p>
	<p>
		以前の <code>num</code> は <code>Display</code> を実装した値なら何でも受け取っていました。そのため文字列も <code>NaN</code>
		も数値の位置に書けてしまい、実際にベンチマークは <code>format!("{'{:.3}'}", …)</code> で丸めた文字列を渡し、母集団が空のときは
		<code>NaN</code> を書いていました。型で分けたことで、どちらも書けなくなりました（37a595c11e）。
	</p>
</div>

<Code item={data.code.integer} />
<Code item={data.code.num} />
<Code item={data.code.fixed} />

<div class="prose-learn">
	<H2 id="escape" />
	<p>
		文字列は <code>write_string</code> でエスケープします。<code>"</code>、<code>\</code>、改行、復帰、タブは短い形に、それ以外の制御文字は
		<code>\u00XX</code> にします。U+2028 と U+2029 はそのまま書きます。構造化データ形式としては正しいのですが、古い JavaScript
		の文字列リテラルに埋め込むと構文エラーになる文字です。
	</p>
	<p>
		エスケープの要らない文字は、一文字ずつではなく、次にエスケープする位置までをまとめて一度にコピーします。エスケープが要るバイトはすべて
		基本文字の範囲内なので、区切りは必ず文字の境目に来ます。一文字ずつ書いていたころと比べ、命令数は2,767,320,163から2,749,769,496に減りました（−0.6%）。
		検証した出力は変わりませんでした（a6eed170c4）。
	</p>
</div>

<Code item={data.code.writeString} />

<div class="prose-learn">
	<p>
		テストは一文字ずつ書く元の定義（<code>by_char</code>）を残しておき、英数字などの基本文字 のすべての文字と、エスケープと多バイト文字が混ざったテキストで、二つの出力が一致することを確かめます。
	</p>
</div>

<Code item={data.code.escapeTest} />
<Code item={data.code.test} />

<ChapterFooter chapter={c} />
