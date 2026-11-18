import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<span></span>`);
var root_1 = $.from_html(`<div></div> <p></p> <!>`, 1);
export default function Bind_this_const($$anchor) {
	let items = $.proxy([{ id: 1 }]);
	let els = $.proxy({});
	let refs = $.proxy([]);
	let n = 0;
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.each(node, 17, () => items, $.index, ($$anchor, item, i) => {
		const key = $.derived(() => $.get(item).id);
		const k2 = $.derived(() => $.get(key) + n);
		var fragment_1 = root_1();
		var div = $.first_child(fragment_1);
		$.bind_this(div, ($$value, key) => els[key] = $$value, (key) => els?.[key], () => [$.get(key)]);
		var p = $.sibling(div, 2);
		$.bind_this(p, ($$value, k2, i) => refs[k2][i] = $$value, (k2, i) => refs?.[k2]?.[i], () => [$.get(k2), i]);
		var node_1 = $.sibling(p, 2);
		{
			var consequent = ($$anchor) => {
				const inner = $.derived(() => $.get(item).id);
				var span = root();
				$.bind_this(span, ($$value) => els[$.get(inner)] = $$value, () => els?.[$.get(inner)]);
				$.append($$anchor, span);
			};
			$.if(node_1, ($$render) => {
				if (n) $$render(consequent);
			});
		}
		$.append($$anchor, fragment_1);
	});
	$.append($$anchor, fragment);
}
