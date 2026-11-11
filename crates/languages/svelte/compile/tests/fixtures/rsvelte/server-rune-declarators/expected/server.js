import * as $ from "svelte/internal/server";
export default function Server_rune_declarators($$renderer) {
	let items = [{ a: 0 }];
	let start = items;
	function f() {
		const copy = items;
		return copy;
	}
	$$renderer.push(`<p>${$.escape(JSON.stringify(start))} ${$.escape(f())}</p>`);
}
