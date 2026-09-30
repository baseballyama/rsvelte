<script lang="ts">
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import DeepDive from '$lib/components/DeepDive.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';
	import PoolViz from '$lib/widgets/PoolViz.svelte';

	let { data } = $props();
	const c = chapter('pool');
	const pct = (a: number, b: number) => ((1 - a / b) * 100).toFixed(0);
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="一つのワーカーは文書を次々に処理します。前の文書の構文木が使い終わったベクタの容量を、次の文書がそのまま使えば、伸ばすための確保がほとんど要らなくなります。"
/>

<div class="prose-learn">
	<H2 id="idea" />
	<p>
		<code>rsv_js</code> の構文木 <code>Ast</code> は、ノードの種類、フラグ、データ、位置などを列ごとのベクタに持っています。文書を一つパースすると、それぞれのベクタがノードの数まで伸び、そのたびに確保し直します。文書が終わると木は捨てられ、次の文書でまた
		0 から伸ばします。
	</p>
	<p>
		<code>pool</code> は、捨てる木のベクタを中身だけ空にしてスレッドローカルに取っておき、次に作る木に渡します。木は作るときにバッファを借り（<code
			>take</code
		>）、<code>Drop</code> で返します（<code>give</code>）。
	</p>

	<H2 id="take-give" />
</div>

<Code item={data.code.take} />
<Code item={data.code.give} />

<div class="prose-learn">
	<p>
		どちらも中身は <code>take_at</code> と <code>give_at</code> で、違うのは棚を選ぶ鍵だけです。プールの中身は、鍵（<code>TypeId</code>）ごとの生のポインタと容量と
		<code>Layout</code> の列、それに全体で持っているバイト数です。
	</p>
</div>

<Code item={data.code.pool} />
<Code item={data.code.takeAt} />

<div class="prose-learn">
	<p>
		<code>take_at</code> はバッファを <code>Vec::from_raw_parts</code> で長さ 0 として組み立て直します。長さ 0
		のベクタは中身を読まないので、型さえ合っていれば安全です。型が合うことは鍵が保証します。鍵は <code>T</code> 自身か
		<code>(K, T)</code> の <code>TypeId</code> で、どちらの鍵の下にも <code>Vec&lt;T&gt;</code> から来たバッファしか入りません。
	</p>
</div>

<PoolViz />

<div class="prose-learn">
	<H2 id="keyed" />
	<p>
		以前のプールは、要素の型だけを鍵にしていました。すると、同じ要素型の列を持つ別々の構造が、同じ棚からバッファを取り合います。たとえば文書の名前を貯める
		Interner の <code>buf</code> と、整形器の出力バッファは、どちらも <code>u8</code> のバッファです。片方が大きなバッファを返すと、もう片方が次の文書でそれを受け取り、さらに伸ばして返します。互いに相手の大きさまで伸ばし合うので、どちらかをプールに入れると、もう一方の退行として現れていました。
	</p>
	<p>
		そこで、持ち主の型も鍵に含める <code>take_keyed::&lt;K, T&gt;</code> と <code>give_keyed</code> を足しました。<code>K</code>
		は構造体そのもの（<code>Ast</code>、<code>Docs</code>、<code>Component</code>、<code>Interner</code>）で、同じ持ち主の同じ型の列だけが棚を共有します。<code
			>String</code
		>
		のバッファは <code>take_string</code> と <code>give_string</code> で、<code>u8</code> の棚を通します。
	</p>
</div>

<Code item={data.code.takeKeyed} />
<Code item={data.code.giveKeyed} />
<Code item={data.code.takeString} />

<div class="prose-learn">
	<p>
		一人の持ち主の中にも、同じ型の列が複数あることがあります。<code>Ast</code> では <code>extra</code> と、パーサの作業用スタック
		<code>scratch</code> がどちらも <code>Vec&lt;NodeId&gt;</code> です。棚は後入れ先出しなので、借りた順の逆に返せば、次の文書でもそれぞれが自分の大きさのバッファを受け取ります。
	</p>
</div>

<Code item={data.code.astDrop} />
<Code item={data.code.keyedTest} />

<div class="prose-learn">
	<p>
		鍵を持ち主ごとに分け、木、文書 IR のアリーナ、Svelte のコンポーネント、Interner がそれぞれ自分の棚を使うようにした変更で、1 ラウンドの割り当ては
		2,667,581 回から 2,488,731 回（−6.7%）、バイト数は 205,928,932 から 188,999,498 に減りました。増えた計数はありません（20f5846343）。
	</p>

	<H2 id="limits" />
	<p>
		プールが持つ量には二つの上限があります。一つの棚に置けるのは <code>MAX_PER_KEY</code> 個までです。そして、スレッドのプール全体で持てるのは
		<code>MAX_BYTES</code>（64 MiB）までです。どちらかを超えるバッファは、棚に置かずに普通に解放します。
	</p>
</div>

<Code item={data.code.perKey} />
<Code item={data.code.maxBytes} />
<Code item={data.code.giveAt} mark={['if p.bytes + layout.size() > MAX_BYTES {', 'let room = slot.len() < MAX_PER_KEY;']} />

<div class="prose-learn">
	<p>
		バイトの予算は後から足したものです。予算がないと、一度だけ現れた巨大な文書のバッファが、その後ずっとプールに残ります。一回で終わる CLI
		なら問題になりませんが、言語サーバーのように長く動くプロセスでは、ピークのメモリがいつまでも下がりません。
	</p>
	<p>
		この予算は、コーパスでは一度も効きません。予算を入れても割り当ての計数は一つも動きませんでした。それでも予算が本当に経路の上にあることは、対照で確かめてあります。予算を
		64 KiB に縮めると、1 ラウンドの割り当ては 2,021,660 回から 2,547,339 回に増えます。代わりに、帳簿付けの費用が命令数で +0.22%（2,749,769,496 →
		2,755,832,077）かかり、そのすべてが <code>take</code> と <code>give</code> の中にあります。一つの構造の借り入れと返却を一度の借用にまとめる形も試しましたが
		+0.26% で取り戻せず、呼び出し一回ずつの API のままにしています（e8eef831d3）。
	</p>
</div>

<Code item={data.code.budgetTest} />

<div class="prose-learn">
	<p>
		<code>take</code> は、容量に関係なく最後に返されたベクタを渡します（後入れ先出し）。図で文書 3（ノード 300）の最初の
		<code>take</code> を見ると、直前の文書でパースに使った小さなベクタが渡され、そこから伸ばし直していることが分かります<Note
			>容量が大きいものから渡す、あるいは必要な大きさに近いものを選ぶ、といった工夫はしていません。どれが効くかは、測ってから決めることになります。</Note
		>。図の「予算」を押すと、予算を超えるバッファが解放され、次の文書がまた伸ばし直す様子が見えます。
	</p>
	<p>スレッドが終わるときは、プールに残ったベクタを <code>Layout</code> を使って解放します。</p>
</div>

<Code item={data.code.drop} />

<div class="prose-learn">
	<p>
		プールはスレッドローカルなので、ワーカーが同じであるあいだだけ効きます。rayon の既定のスレッドは実行をまたいで残ります。<code
			>RunOptions::threads</code
		>
		を指定した実行も、<code>in_pool</code> がスレッド数ごとのプールをプロセスのあいだ残すので、同じスレッドと、そのスレッドが貯めた容量を使い回します（<a
			href="/learn/kernel/pipeline#run">06</a
		>）。
	</p>

	<H2 id="users" />
	<p>今プールを使っている構造は次のとおりです。</p>
	<ul>
		<li><code>rsv_js::Ast</code>: 構文木の列、文字列、コメント、型の表、パーサの作業用スタック（<a href="/learn/polish#history">14</a>）。</li>
		<li><code>Tokens&lt;K&gt;</code>: トークン表（<a href="/learn/kernel/layers#tokens">05</a>）。鍵は要素の型 <code>Token&lt;K&gt;</code> だけです。</li>
		<li><code>rsv_svelte::ast::Component</code>: テンプレートの列。</li>
		<li><code>Docs</code>: 文書 IR のアリーナ（<a href="/learn/kernel/doc#ir">08</a>）と、プリンタのスタックや作業リスト。</li>
		<li><code>Interner</code>: 名前の文字列、終端、ハッシュ表（<a href="/learn/kernel/intern#growth">03</a>）。</li>
	</ul>
</div>

<Code item={data.code.tokensDefault} />
<Code item={data.code.componentDrop} />

<div class="prose-learn">
	<p>
		トークン表とコンポーネントの列をプールに入れる前は、コンポーネントのトークン表を文書ごとにソースの長さの 4 分の 1 だけ確保しては捨てていて、<code
			>svelte.parse</code
		>
		は 32 MB のソースに対して 1 ラウンドで 253 MB を確保していました。プールに入れた変更で、1 ラウンドの確保バイト数は 385,305,807 から 210,562,915（−45%）になりました（92571ee562）。
	</p>

	<H2 id="measure" />
	<p>
		<code>set_enabled(false)</code> にすると、<code>take</code> は常に空のベクタを返し、<code>give</code>
		は何もしません。この切り替えは、効果を測るためだけにあります。
	</p>
</div>

<Code item={data.code.setEnabled} />

<div class="prose-learn">
	<p>
		ベンチマークの <code>nopool</code> アームがこれを使います。ビルド <code>{data.benchRev.slice(0, 10)}</code> で {data.docs.toLocaleString('en-US')}
		文書を処理したとき、プールを切ると中央値は {data.shared.plain[0].toFixed(1)} ms から {data.nopool.plain[0].toFixed(1)} ms に、割り当て回数は
		{(data.shared.allocs / 1e6).toFixed(2)}M 回から {(data.nopool.allocs / 1e6).toFixed(2)}M 回に増えました。プールがあることで、時間は約 {pct(
			data.shared.plain[0],
			data.nopool.plain[0]
		)}%、割り当ては約 {pct(data.shared.allocs, data.nopool.allocs)}% 減っています。
	</p>
	<DeepDive title="この比較が古い理由">
		<p>
			このアームの比較は、プールが要素の型だけを鍵にし、トークン表もコンポーネントも Interner もプールに入っていなかったころのビルドで測ったものです。それ以降の変更の効果は、上に書いたとおり性能のラチェットの計数（1
			スレッド、最後のラウンド）で測っていて、ベンチマークの壁時計とは別の量です（<a href="/learn/measure#ratchet">13</a>）。
		</p>
	</DeepDive>
</div>

<Code item={data.code.test} />

<ChapterFooter chapter={c} />
