<script lang="ts">
	import ChapterFooter from '$lib/components/ChapterFooter.svelte';
	import ChapterHeader from '$lib/components/ChapterHeader.svelte';
	import Code from '$lib/components/Code.svelte';
	import H2 from '$lib/components/H2.svelte';
	import Note from '$lib/components/Note.svelte';
	import { chapter } from '$lib/site';

	let { data } = $props();
	const c = chapter('measure');
	const fmt = (n: number) => n.toLocaleString('en-US');
	const mb = (b: number) => (b / 1e6).toFixed(1);
	const a = (name: string) => {
		const x = data.arms.find((y) => y.name === name);
		if (!x) throw new Error(`no arm ${name}`);
		return x;
	};
	const armDoc: Record<string, string> = {
		shared: '文書のタスクがアーティファクトを共有、pool あり、全スレッド',
		isolated: 'タスクごとに計算し直す',
		nopool: 'pool なし',
		serial: '1 スレッド',
		streaming: 'shared に加え、結果を確定した順に捨てる'
	};
	const totalSelf = $derived(data.phases.reduce((n, p) => n + p.self_ms, 0));
	const maxMs = $derived(Math.max(...data.arms.map((x) => x.plain[0])));
</script>

<svelte:head><title>{c.title} — rsvelte Learn</title></svelte:head>

<ChapterHeader
	chapter={c}
	lead="各章で触れた数字の出どころです。ベンチマークは、同じ文書と同じタスクを、仕組みを一つだけ変えて走らせます。二つのアームの差が、その仕組みの効果です。"
/>

<div class="prose-learn">
	<H2 id="arms" />
	<p>
		<code>rsv bench</code> は五つのアームを持ちます。どのアームも同じ {fmt(data.population.documents)} 文書（{mb(data.population.bytes)}
		MB）に同じ四つのタスク（compile/client、compile/server、format、lint）を走らせます<Note
			>型検査は外部の <code>tsc</code> を起動するので、ベンチマークには入れていません。</Note
		>。
	</p>
</div>

<Code item={data.code.doc} />

<div class="prose-learn">
	<p>
		時間を測るラウンドは、アームを ABBA の順（奇数ラウンドは逆順）に交互に走らせ、{data.rounds} ラウンドの中央値を取ります。割り当てとピークは、プロセス全体の追跡を入れた別のラウンドで取ります（<a
			href="/learn/kernel/metrics#global">11</a
		>）。ビルドは metrics なしとありの二種類を、それぞれ二回走らせました。
	</p>

	<H2 id="time" />
</div>

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table min-w-[640px]">
		<thead>
			<tr><th>アーム</th><th class="w-[30%]"></th><th class="num">plain ms</th><th class="num">metrics ms</th><th class="num">各ラウンド（plain 1 回目）</th></tr>
		</thead>
		<tbody>
			{#each data.arms as x (x.name)}
				<tr>
					<td><code>{x.name}</code><div class="text-[13px] text-muted">{armDoc[x.name]}</div></td>
					<td class="align-middle"><div class="h-2 bg-surface"><div class={['h-2', x.name === 'shared' ? 'bg-fg' : 'bg-line-strong']} style:width="{(x.plain[0] / maxMs) * 100}%"></div></div></td>
					<td class="num">{x.plain.map((v) => v.toFixed(1)).join(' / ')}</td>
					<td class="num">{x.metrics.map((v) => v.toFixed(1)).join(' / ')}</td>
					<td class="num font-mono text-[12px] text-muted">{data.rawRounds[x.name].map((v: number) => v.toFixed(0)).join(' ')}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">
		中央値。plain と metrics はそれぞれ 2 回の実行。{data.threads} スレッド、{data.build.profile}、build {data.build.rev.slice(0, 10)}。
	</figcaption>
</figure>

<div class="prose-learn">
	<ul>
		<li>
			<strong>共有</strong>: isolated → shared で {(a('isolated').plain[0] / a('shared').plain[0]).toFixed(1)} 倍速くなります（<a
				href="/learn/kernel/db#sharing">04</a
			>）。
		</li>
		<li>
			<strong>並列化</strong>: serial → shared で {(a('serial').plain[0] / a('shared').plain[0]).toFixed(1)} 倍です（{data.threads} スレッド）。
		</li>
		<li>
			<strong>pool</strong>: nopool → shared で時間が {((1 - a('shared').plain[0] / a('nopool').plain[0]) * 100).toFixed(0)}% 減ります（<a
				href="/learn/kernel/pool#measure">12</a
			>）。
		</li>
		<li>
			<strong>ストリーミング</strong>: 時間の差は、同じアームの二回の実行の差（{Math.abs(a('streaming').plain[0] - a('streaming').plain[1]).toFixed(1)}
			ms）と同じ程度で、差があるとは言えません。
		</li>
	</ul>

	<H2 id="memory" />
</div>

<figure class="my-8 overflow-x-auto">
	<table class="table">
		<thead><tr><th>アーム</th><th class="num">割り当て回数</th><th class="num">バイト</th><th class="num">回/入力バイト</th><th class="num">ピーク増分</th></tr></thead>
		<tbody>
			{#each data.arms as x (x.name)}
				<tr>
					<td><code>{x.name}</code></td>
					<td class="num">{fmt(x.allocs)}</td>
					<td class="num">{mb(x.allocBytes)} MB</td>
					<td class="num">{x.allocsPerByte.toFixed(3)}</td>
					<td class={['num', x.name === 'streaming' && 'font-medium']}>{mb(x.peak)} MB</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">metrics ありのビルドの 1 回目、プロセス全体を追跡したラウンド。最大 RSS は {mb(data.maxRss)} MB（全アームを含むプロセスの最高値）。</figcaption>
</figure>

<div class="prose-learn">
	<p>
		ピーク増分は、結果を全部持つアームではどれも約 {mb(a('shared').peak)} MB で、スレッド数にもよりません（serial でも {mb(a('serial').peak)}
		MB）。支配しているのは処理中の作業ではなく、全結果の保持だということです。<code>run_each</code> で結果をすぐ捨てると {mb(a('streaming').peak)}
		MB になります（<a href="/learn/kernel/pipeline#run-each">06</a>）。
	</p>

	<H2 id="phases" />
	<p>
		metrics ありのビルドで、shared を一回走らせたときのフェーズ表です。self は入れ子のフェーズを除いた時間で、全スレッドの合計です。
	</p>
</div>

<figure class="my-8 overflow-x-auto xl:mr-[calc(-232px-48px)]">
	<table class="table min-w-[640px]">
		<thead><tr><th>フェーズ</th><th class="num">呼び出し</th><th class="num">self ms</th><th class="num">割合</th><th class="num">self 割り当て</th><th class="num">self バイト</th></tr></thead>
		<tbody>
			{#each data.phases as p (p.name)}
				<tr>
					<td><code>{p.name}</code></td>
					<td class="num">{fmt(p.calls)}</td>
					<td class="num">{p.self_ms.toFixed(1)}</td>
					<td class="num">{((p.self_ms / totalSelf) * 100).toFixed(1)}%</td>
					<td class="num">{fmt(p.self_allocs)}</td>
					<td class="num">{mb(p.self_bytes)} MB</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<figcaption class="mt-2 text-[13px] leading-[1.7] text-muted">割合は、この表の self の合計に対するもの。</figcaption>
</figure>

<div class="prose-learn">
	<p>
		<code>svelte.parse</code> は全文書で一回ずつ呼ばれ、下流のフェーズはパースが通った文書でだけ走ります。compile のタスク自体の self
		はごく小さく、時間はそれが求めたアーティファクトと、<code>svelte.lower.*</code>・<code>js.print</code> に付いています。
	</p>

	<H2 id="correctness" />
	<p>
		タスク表の「診断なし」は正しさを意味しません。ほとんどの診断は「未対応」の拒否で、診断のない出力が上流と一致するかは別に測ります。
	</p>
</div>

<figure class="my-8 overflow-x-auto">
	<table class="table">
		<thead><tr><th>タスク</th><th class="num">実行</th><th class="num">診断なし</th><th class="num">診断あり</th></tr></thead>
		<tbody>
			{#each Object.entries(data.population.tasks) as [id, t] (id)}
				<tr><td><code>{id}</code></td><td class="num">{fmt(t.ran)}</td><td class="num">{fmt(t.clean)}</td><td class="num">{fmt(t.diagnostics)}</td></tr>
			{/each}
		</tbody>
	</table>
</figure>

<div class="prose-learn">
	<p>
		コンパイルの出力を上流の Svelte と比べると、JS を出力した {fmt(data.corpus.emitted)} ユニットのうち、一致したのは {fmt(data.corpus.matched)}
		ユニット（{((data.corpus.matched / data.corpus.emitted) * 100).toFixed(0)}%）でした。{fmt(data.corpus.unparseable)} ユニットでは、JavaScript
		としてパースできない出力を出しています。本来は拒否すべきところです（測定 {data.corpus.rev}、出典 {data.corpus.source}）。
	</p>

	<H2 id="reproduce" />
</div>

<pre class="my-6 overflow-x-auto rounded-sm border border-line bg-sunken p-4 text-[13px] leading-[1.7]"><code
		>cargo build --release -p rsv_cli --features metrics
./target/release/rsv bench fixtures/svelte rounds=5 json=bench.json</code
	></pre>

<div class="prose-learn">
	<p>
		レポートの <code>build.rev</code> は、ビルドしたツリーの <code>git rev-parse HEAD</code> です（差分があれば <code>-dirty</code>
		が付きます）。値を運べない欄は、0 ではなく <code>UNMEASURED</code> と書きます。このページの表は、そのレポートの JSON
		をサイトのデータとしてコミットし、ビルド時に読み込んで作っています。
	</p>
</div>

<ChapterFooter chapter={c} />
