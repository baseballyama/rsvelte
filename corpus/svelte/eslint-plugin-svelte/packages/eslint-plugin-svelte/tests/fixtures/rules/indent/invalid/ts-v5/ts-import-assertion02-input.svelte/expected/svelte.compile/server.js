import * as $ from 'svelte/internal/server';

export default function Ts_import_assertion02_input($$renderer) {
	import("./foo.json", { assert: { type: "json" } });
}