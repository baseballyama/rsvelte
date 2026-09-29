<script lang="ts">
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
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
		<code>pool</code> は、捨てる木のベクタを中身だけ空にしてスレッドローカルに取っておき、次に作る木に渡します。<code>Ast</code>
		は作るときに <code>pool::take</code> し、<code>Drop</code> で <code>pool::give</code> します。
	</p>

	<H2 id="take-give" />
</div>

<Code item={data.code.take} />
<Code item={data.code.give} />

<div class="prose-learn">
	<p>
		プールは要素の型（<code>TypeId</code>）ごとに分かれていて、中身は生のポインタと容量と <code>Layout</code> です。<code>take</code>
		は同じ型のベクタを <code>Vec::from_raw_parts</code> で長さ 0 として組み立て直します。長さ 0 のベクタは、どんな型でも中身を読まないので安全です。
	</p>
</div>

<PoolViz />

<div class="prose-learn">
	<H2 id="limits" />
	<p>型ごとに持てるのは <code>MAX_PER_TYPE</code> 個までで、それを超えて返されたベクタは普通に解放します。</p>
</div>

<Code item={data.code.consts} />

<div class="prose-learn">
	<p>
		<code>take</code> は、容量に関係なく最後に返されたベクタを渡します（後入れ先出し）。図で文書 3（ノード 300）の最初の
		<code>take</code> を見ると、直前の文書でパースに使った小さなベクタが渡され、そこから伸ばし直していることが分かります<Note
			>容量が大きいものから渡す、あるいは必要な大きさに近いものを選ぶ、といった工夫はしていません。どれが効くかは、測ってから決めることになります。</Note
		>。
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
			href="/learn/kernel/pipeline#run">05</a
		>）。
	</p>
</div>

<div class="prose-learn">
	<H2 id="measure" />
	<p>
		<code>set_enabled(false)</code> にすると、<code>take</code> は常に空のベクタを返し、<code>give</code>
		は何もしません。この切り替えは、効果を測るためだけにあります。
	</p>
</div>

<Code item={data.code.setEnabled} />

<div class="prose-learn">
	<p>
		ベンチマークの <code>nopool</code> アームがこれを使います。{data.docs.toLocaleString('en-US')} 文書で、プールを切ると中央値は {data.shared.plain[0].toFixed(1)}
		ms から {data.nopool.plain[0].toFixed(1)} ms に、割り当て回数は {(data.shared.allocs / 1e6).toFixed(2)}M 回から
		{(data.nopool.allocs / 1e6).toFixed(2)}M 回に増えました。プールがあることで、時間は約 {pct(data.shared.plain[0], data.nopool.plain[0])}%、割り当ては約
		{pct(data.shared.allocs, data.nopool.allocs)}% 減っています。
	</p>
</div>

<Code item={data.code.test} />

<ChapterFooter chapter={c} />
