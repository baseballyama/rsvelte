import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(` <!> <button>x</button>`, 1);
export default function Rest_exclude_literal_keys($$anchor) {
	let o = $.proxy({});
	let xs = $.proxy([]);
	let big = $.derived(() => o[10n]), none = $.derived(() => o[null]), derived = $.derived(() => $.exclude_from_object(o, ["10", "null"]));
	let tmp = {}, half = $.proxy(tmp[1.5]), state = $.proxy($.exclude_from_object(tmp, ["1.5"]));
	let yes;
	let regex;
	let assigned;
	function assign(value) {
		({[true]: yes, [/x/g]: regex, ...assigned} = value);
	}
	$.next();
	var fragment = root();
	var text = $.first_child(fragment);
	var node = $.sibling(text);
	$.each(node, 17, () => xs, $.index, ($$anchor, $$item) => {
		let one = () => $.get($$item)[1n];
		let s = () => $.get($$item)["s"];
		let item = () => $.exclude_from_object($.get($$item), ["1", "s"]);
		$.next();
		var text_1 = $.text();
		$.template_effect(() => $.set_text(text_1, `${one() ?? ""}${s() ?? ""}${item() ?? ""}`));
		$.append($$anchor, text_1);
	});
	var button = $.sibling(node, 2);
	$.template_effect(() => $.set_text(text, `${$.get(big) ?? ""}${$.get(none) ?? ""}${$.get(derived) ?? ""}${half ?? ""}${state ?? ""}${yes ?? ""}${regex ?? ""}${assigned ?? ""} `));
	$.delegated("click", button, () => assign(o));
	$.append($$anchor, fragment);
}
$.delegate(["click"]);
