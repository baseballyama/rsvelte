import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p>`);
export default function Server_rune_declarators($$anchor) {
	let items = $.proxy([{ a: 0 }]);
	let start = $.snapshot(items);
	function f() {
		const copy = $.snapshot(items);
		return copy;
	}
	var p = root();
	var text = $.only_child(p);
	$.template_effect(($0, $1) => $.set_text(text, `${$0 ?? ""} ${$1 ?? ""}`), [() => JSON.stringify(start), () => f()]);
	$.append($$anchor, p);
}
