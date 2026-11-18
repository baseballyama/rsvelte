import * as $ from "svelte/internal/server";
import { tick } from "svelte";
export const row = 1;
export default function Snippet_beside_a_module_script($$renderer) {
	function row($$renderer) {
		$$renderer.push(`<b>${$.escape(tick)}</b>`);
	}
	row($$renderer);
}
