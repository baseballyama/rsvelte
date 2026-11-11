import * as $ from "svelte/internal/server";
export default function Server_rune_declarators($$renderer) {
	let items = [{ a: 0 }];
	let start = $.snapshot(items);
	let eager = items;
	let pending = 0;
	function f() {
		const copy = $.snapshot(items);
		return copy;
	}
	$$renderer.push(`<p>${$.escape(JSON.stringify(start))} ${$.escape(f())} ${$.escape(eager)} ${$.escape(pending)}</p>`);
}
