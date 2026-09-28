<script lang="ts">
	import Figure from '$lib/components/Figure.svelte';
	import { makeDocs, simulate } from '$lib/kernel/pipeline-sim';

	let workers = $state(4);
	let partShare = $state(0.15);
	let t = $state(Infinity);
	let playing = $state(false);

	const docs = $derived(makeDocs(36, partShare));
	const sim = $derived(simulate(docs, workers, 6));
	const T = $derived(sim.projectEnd);
	const now = $derived(Math.min(t, T));

	const W = 720;
	const lane = 22;
	const lanesH = $derived(workers * lane + lane + 8);
	const memH = 90;
	const x = (v: number) => 90 + (v / Math.max(T, 1)) * (W - 100);
	const maxMem = $derived(Math.max(sim.peakCollected, 1));
	const y = (v: number) => memH - 6 - (v / maxMem) * (memH - 16);

	function liveAt(curve: [number, number][], at: number) {
		let v = 0;
		for (const [time, live] of curve) if (time <= at) v = live;
		return v;
	}
	function pathOf(curve: [number, number][]) {
		let d = `M${x(0)} ${y(0)}`;
		let prev = 0;
		for (const [time, live] of curve) {
			if (time > now) break;
			d += ` H${x(time)} V${y(live)}`;
			prev = live;
		}
		return d + ` H${x(now)} V${y(prev)}`;
	}

	let raf = 0;
	function play() {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			t = Infinity;
			return;
		}
		playing = true;
		t = 0;
		const t0 = performance.now();
		const tick = (ts: number) => {
			t = ((ts - t0) / 3000) * T;
			if (t < T && playing) raf = requestAnimationFrame(tick);
			else playing = false;
		};
		raf = requestAnimationFrame(tick);
	}
	function stop() {
		playing = false;
		cancelAnimationFrame(raf);
		t = Infinity;
	}
	$effect(() => () => cancelAnimationFrame(raf));
</script>

<Figure label="図 5.1 · run_each のモデル" wide>
	{#snippet controls()}
		<label class="flex items-center gap-2 font-mono text-[12px] tracking-normal text-fg-2">
			ワーカー {workers}
			<input class="range w-24" type="range" min="1" max="8" bind:value={workers} />
		</label>
		{#each [[0, '部品なし'], [0.15, '15%'], [1, '全部']] as [v, name] (name)}
			<button type="button" class="btn-ghost" aria-pressed={partShare === v} onclick={() => (partShare = Number(v))}>{name}</button>
		{/each}
		<button type="button" class="btn-ghost" onclick={playing ? stop : play}>{playing ? '■ 停止' : '▶ 再生'}</button>
	{/snippet}
	<div class="overflow-x-auto p-4">
		<svg viewBox="0 0 {W} {lanesH + memH + 24}" class="h-auto w-full min-w-[560px]" role="img">
			<title>ワーカーごとの文書の処理と、保持している結果の量</title>
			{#each Array.from({ length: workers }, (_, i) => i) as w (w)}
				<text x="0" y={w * lane + 15} class="font-mono" font-size="11" fill="var(--muted)">worker {w}</text>
				<line x1={x(0)} x2={x(T)} y1={w * lane + 11} y2={w * lane + 11} stroke="var(--border)" />
			{/each}
			{#each sim.blocks.filter((b) => b.start < now) as b (b.doc)}
				<rect
					x={x(b.start) + 0.5}
					y={b.worker * lane + 3}
					width={Math.max(x(Math.min(b.end, now)) - x(b.start) - 1, 1)}
					height={lane - 7}
					rx="2"
					fill={b.held ? 'var(--c-map)' : 'var(--c-src)'}
					opacity={b.end <= now ? 0.85 : 0.45}
				/>
			{/each}
			<text x="0" y={workers * lane + 15} class="font-mono" font-size="11" fill="var(--muted)">project</text>
			{#if sim.projectEnd > sim.parallelEnd && now > sim.parallelEnd}
				<rect
					x={x(sim.parallelEnd)}
					y={workers * lane + 3}
					width={x(now) - x(sim.parallelEnd)}
					height={lane - 7}
					rx="2"
					fill="var(--c-idle)"
				/>
			{/if}
			<g transform="translate(0 {lanesH})">
				<text x="0" y="12" class="font-mono" font-size="11" fill="var(--muted)">保持量</text>
				<line x1={x(0)} x2={x(T)} y1={y(0)} y2={y(0)} stroke="var(--border-strong)" />
				<path d={pathOf(sim.collected)} fill="none" stroke="var(--muted)" stroke-dasharray="3 3" />
				<path d={pathOf(sim.streaming)} fill="none" stroke="var(--fg)" />
				<text x="0" y="30" class="font-mono" font-size="10.5" fill="var(--fg)">run_each {liveAt(sim.streaming, now)}</text>
				<text x="0" y="44" class="font-mono" font-size="10.5" fill="var(--muted)">run {liveAt(sim.collected, now)}</text>
			</g>
			<line x1={x(now)} x2={x(now)} y1="0" y2={lanesH + memH} stroke="var(--accent)" opacity={now < T ? 1 : 0} />
			<text x={x(0)} y={lanesH + memH + 18} class="font-mono" font-size="11" fill="var(--muted)">0</text>
			<text x={x(T)} y={lanesH + memH + 18} text-anchor="end" class="font-mono" font-size="11" fill="var(--muted)">{T} 単位時間</text>
		</svg>
		<div class="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11.5px] tracking-normal text-muted">
			<span><span class="mr-1 inline-block h-2 w-3 bg-c-src align-middle"></span>すぐ sink に渡る文書</span>
			<span><span class="mr-1 inline-block h-2 w-3 bg-c-map align-middle"></span>部品を持ち、プロジェクトパスを待つ文書</span>
			<span><span class="mr-1 inline-block h-2 w-3 bg-c-idle align-middle"></span>ProjectTask::finish</span>
			<span>ピーク: run_each {sim.peakStreaming} · run {sim.peakCollected}</span>
		</div>
	</div>
	{#snippet caption()}
		模型です。文書は空いたワーカーに順に配ります（rayon の work stealing を単純化したもの）。処理時間と結果の大きさは例示で、実測ではありません。実線は <code>run_each</code>
		が生かしている結果の量、破線は <code>run</code> のように全部を集めた場合の量です。部品を持つ文書が増えるほど、二つの線は近づきます。
	{/snippet}
</Figure>
