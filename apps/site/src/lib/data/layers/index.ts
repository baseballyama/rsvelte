// One component's layers as the Rust pipeline built them, printed by
// `cargo run -p rsv_svelte --example layers -- src/lib/data/layers/Toolbar.svelte.txt` (a `.txt` so
// the site's own svelte-check does not type-check the sample).
import toolbar from './Toolbar.json';

export type Range = [number, number];

export interface SurfaceRow {
	depth: number;
	label: string;
	span: Range;
	/** The surface node id (`TId`); `null` for the `alt` slot of an `If`. */
	id: number | null;
}

export interface HirRow {
	depth: number;
	label: string;
	span: Range;
	/** `HirId`; `null` for a branch or `else` of an `If` node. */
	id: number | null;
	/** The surface node this row was built from. */
	origin: number | null;
	attrs?: { name: string; value: string }[];
}

export interface Binding {
	id: number;
	name: string;
	decl: string;
	rune: string;
	reads: number;
	writes: number;
	span: Range;
}

export interface Layers {
	src: string;
	ast: SurfaceRow[];
	hir: HirRow[];
	bindings: Binding[];
	refs: { span: Range; binding: number | null }[];
	lint: { rule: string; layer: 'early' | 'late'; message: string; span: Range }[];
}

export const TOOLBAR = toolbar as Layers;
