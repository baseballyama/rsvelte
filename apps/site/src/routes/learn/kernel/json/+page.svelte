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
	lead="lint の結果、型検査の結果、ベンチマークのレポート。カーネルが書く JSON は、値の木を作らずに文字列へ直接書きます。"
/>

<div class="prose-learn">
	<H2 id="state" />
	<p>
		<code>serde_json::Value</code> のような値の木を作ると、オブジェクトのキーごとに文字列を確保することになります。出力は一回書けば終わりなので、木を作る意味はありません<Note
			>rsvelte の main ブランチ（Svelte の AST を JSON で扱う実装）の計測では、<code>serde_json::Value</code> のオブジェクトキーが割り当ての大部分を占めることが測定で分かっています。</Note
		>。JsonWriter は、呼ばれた順に文字列へ追記するだけです。
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
		数値は <code>Display</code> を実装した値なら何でも受け取ります。ベンチマークでは <code>format!("{'{:.3}'}", ms)</code>
		で丸めた文字列を渡しています。ただし、渡した文字列が JSON の数値として正しいかは確かめません。
	</p>
</div>

<Code item={data.code.num} />

<div class="prose-learn">
	<H2 id="escape" />
	<p>
		文字列は <code>write_str</code> でエスケープします。<code>"</code>、<code>\</code>、改行、復帰、タブは短い形に、それ以外の制御文字は
		<code>\u00XX</code> にします。U+2028 と U+2029 はそのまま書きます。JSON としては正しいのですが、古い JavaScript
		の文字列リテラルに埋め込むと構文エラーになる文字です。
	</p>
</div>

<Code item={data.code.writeStr} />
<Code item={data.code.test} />

<ChapterFooter chapter={c} />
