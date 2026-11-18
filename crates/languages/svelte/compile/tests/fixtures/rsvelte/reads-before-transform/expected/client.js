import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
const s = ($$anchor, $$arg0, $$arg1, t = $.noop) => {
	let p = $.derived_safe_equal(() => $.fallback(($$arg0?.()).p, q));
	let q = () => ($$arg0?.()).q;
	let r = $.derived_safe_equal(() => $.fallback($$arg1?.(), q()));
	$.next();
	var text = $.text();
	$.template_effect(() => $.set_text(text, `${$.get(p) ?? ""}${q() ?? ""}${$.get(r) ?? ""}${t() ?? ""}`));
	$.append($$anchor, text);
};
var root = $.from_html(`<h1> </h1>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
export default function Reads_before_transform($$anchor, $$props) {
	$.push($$props, true);
	var fragment_1 = root_1();
	var node = $.first_child(fragment_1);
	{
		var consequent = ($$anchor) => {
			const a = $.derived(() => b);
			const f = $.derived(() => () => b);
			const b = $.derived(() => $$props.items.length);
			var h1 = root();
			var text_1 = $.only_child(h1);
			$.template_effect(($0) => $.set_text(text_1, `hello ${$.get(a) ?? ""} ${$0 ?? ""}`), [() => $.get(f)()]);
			$.append($$anchor, h1);
		};
		$.if(node, ($$render) => {
			if ($$props.items) $$render(consequent);
		});
	}
	var node_1 = $.sibling(node, 2);
	$.each(node_1, 17, () => $$props.items, $.index, ($$anchor, $$item) => {
		let a = () => $.get($$item).a;
		let b = $.derived_safe_equal(() => $.fallback($.get($$item).b, c));
		let c = () => $.get($$item).c;
		let d = $.derived_safe_equal(() => $.fallback($.get($$item).d, a()));
		let e = $.derived_safe_equal(() => $.fallback($.get($$item).e, e));
		$.next();
		var text_2 = $.text();
		$.template_effect(() => $.set_text(text_2, `${a() ?? ""}${$.get(b) ?? ""}${c() ?? ""}${$.get(d) ?? ""}${$.get(e) ?? ""}`));
		$.append($$anchor, text_2);
	});
	var node_2 = $.sibling(node_1, 2);
	$.each(node_2, 17, () => $$props.items, $.index, ($$anchor, $$item) => {
		var $$array = $.derived(() => $.to_array($.get($$item), 3));
		let x = () => $.get($$array)[0];
		let y = $.derived_safe_equal(() => $.fallback($.get($$array)[1], z));
		let z = $.derived_safe_equal(() => $.fallback($.get($$array)[2], x()));
		$.next();
		var text_3 = $.text();
		$.template_effect(() => $.set_text(text_3, `${x() ?? ""}${$.get(y) ?? ""}${$.get(z) ?? ""}`));
		$.append($$anchor, text_3);
	});
	var node_3 = $.sibling(node_2, 2);
	s(node_3, () => $$props.items);
	$.append($$anchor, fragment_1);
	$.pop();
}
