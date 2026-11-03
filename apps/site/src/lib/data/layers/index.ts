// One component's layers as the Rust pipeline built them: scripts/generate.ts runs the
// export_site_layers example on Toolbar.svelte.txt (a `.txt` so the site's own svelte-check does not
// type-check the sample).
import toolbar from '#generated/layers/Toolbar.json';

export type Range = [number, number];

interface SurfaceRow {
	depth: number;
	label: string;
	span: Range;
	/** The surface node id (`TId`); `null` for the `alt` slot of an `If`. */
	id: number | null;
}

interface CompilerSyntaxTreeRow {
	depth: number;
	label: string;
	span: Range;
	/** `HirId`; `null` for a branch or `else` of an `If` node. */
	id: number | null;
	/** The surface node this row was built from. */
	origin: number | null;
	attributes?: { name: string; value: string }[];
}

interface Binding {
	id: number;
	name: string;
	declaration: string;
	rune: string;
	reads: number;
	writes: number;
	span: Range;
}

export interface Layers {
	source: string;
	syntax_tree: SurfaceRow[];
	compiler_syntax_tree: CompilerSyntaxTreeRow[];
	bindings: Binding[];
	refs: { span: Range; binding: number | null }[];
	lint: { rule: string; message: string; span: Range }[];
}

export const TOOLBAR = toolbar as Layers;
