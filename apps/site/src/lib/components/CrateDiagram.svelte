<script lang="ts">
	import type { CrateSize } from '$lib/build/source-plugin';

	let { crates }: { crates: CrateSize[] } = $props();

	const size = (name: string) => {
		const c = crates.find((c) => c.name === name);
		if (!c) throw new Error(`no crate ${name}`);
		return c.lines.toLocaleString('en-US');
	};

	interface Box {
		id: string;
		x: number;
		y: number;
		w: number;
		role: string;
	}
	const H = 58;
	const boxes: Box[] = [
		{ id: 'rsvelte_command_line', x: 250, y: 10, w: 260, role: 'fixtures · run · benchmark' },
		{ id: 'rsvelte_svelte', x: 250, y: 110, w: 260, role: 'parse · resolve · analysis' },
		{ id: 'rsvelte_typescript', x: 90, y: 210, w: 260, role: 'JS/TS: parse · scope · print' },
		{ id: 'rsvelte_stylesheet', x: 410, y: 210, w: 260, role: 'CSS: parse · scope' },
		{ id: 'rsvelte_kernel', x: 20, y: 320, w: 720, role: 'source · computation (pipeline · database · plugins) · diagnostics · output · performance' }
	];
	const by = (id: string) => boxes.find((b) => b.id === id)!;
	// rsvelte_svelte reaches the stylesheet crate only through its parser crate, which the figure leaves out.
	const indirect = new Set(['rsvelte_svelte,rsvelte_stylesheet']);
	const edges: [string, string][] = [
		['rsvelte_command_line', 'rsvelte_svelte'],
		['rsvelte_svelte', 'rsvelte_typescript'],
		['rsvelte_svelte', 'rsvelte_stylesheet'],
		['rsvelte_typescript', 'rsvelte_kernel'],
		['rsvelte_stylesheet', 'rsvelte_kernel'],
		['rsvelte_svelte', 'rsvelte_kernel'],
		['rsvelte_command_line', 'rsvelte_kernel']
	];
	function path([a, b]: [string, string]) {
		const s = by(a);
		const t = by(b);
		const sx = s.x + s.w / 2;
		const sy = s.y + H;
		const tx = b === 'rsvelte_kernel' ? Math.min(Math.max(sx, t.x + 20), t.x + t.w - 20) : t.x + t.w / 2;
		const ty = t.y;
		if (a === 'rsvelte_command_line' && b === 'rsvelte_kernel') {
			// Around the plugin on the right, so it does not cross the other edges.
			const rx = 700;
			return `M${s.x + s.w} ${s.y + H / 2} H${rx} V${ty}`;
		}
		if (a === 'rsvelte_svelte' && b === 'rsvelte_kernel') return `M${sx} ${sy} V${ty}`;
		const my = (sy + ty) / 2;
		return `M${sx} ${sy} V${my} H${tx} V${ty}`;
	}
</script>

<svg viewBox="0 0 760 390" class="h-auto w-full" role="img">
	<title>主な crate の依存関係の抜粋。コマンドラインの実行プログラムは言語プラグインを使います。言語プラグインは、埋め込み言語の処理とカーネルを使います。破線は、図にない crate を通した間接の依存です。</title>
	<defs>
		<marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
			<path d="M0 0 L8 4 L0 8 z" fill="var(--border-strong)" />
		</marker>
	</defs>
	{#each edges as e (e.join())}
		<path d={path(e)} fill="none" stroke="var(--border-strong)" stroke-width="1" stroke-dasharray={indirect.has(e.join()) ? '4 3' : undefined} marker-end="url(#arrow)" />
	{/each}
	{#each boxes as b (b.id)}
		{@const kernel = b.id === 'rsvelte_kernel'}
		<g>
			<rect
				x={b.x}
				y={b.y}
				width={b.w}
				height={H}
				rx="4"
				fill={kernel ? 'var(--surface)' : 'var(--bg)'}
				stroke={kernel ? 'var(--fg)' : 'var(--border-strong)'}
				stroke-width="1"
			/>
			<text x={b.x + 12} y={b.y + 23} class="font-mono" font-size="14" font-weight="500" fill="var(--fg)">{b.id}</text>
			<text x={b.x + b.w - 12} y={b.y + 23} text-anchor="end" class="font-mono" font-size="11" fill="var(--muted)"
				>{size(b.id)} 行</text
			>
			<text x={b.x + 12} y={b.y + 44} class="font-mono" font-size="11.5" fill="var(--fg-2)">{b.role}</text>
		</g>
	{/each}
</svg>
