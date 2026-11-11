import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<p> </p>`);
var root_2 = $.from_html(`<ul class="list"></ul> <!> <!>`, 1);
export default function Snippet_nested($$anchor, $$props) {
	$.push($$props, true);
	var fragment = root_2();
	var ul = $.first_child(fragment);
	{
		const row = ($$anchor, item = $.noop, $$arg1) => {
			let index = $.derived_safe_equal(() => $.fallback($$arg1?.(), 0));
			var li = root();
			var text = $.only_child(li);
			$.template_effect(() => $.set_text(text, `${$.get(index) ?? ""}: ${item().label ?? ""}`));
			$.append($$anchor, li);
		};
		$.each(ul, 21, () => $$props.items, $.index, ($$anchor, item, i) => {
			row($$anchor, () => $.get(item), () => i);
		});
		$.reset(ul);
	}
	var node = $.sibling(ul, 2);
	{
		var consequent = ($$anchor) => {
			const empty = ($$anchor, $$arg0) => {
				let title = () => ($$arg0?.()).title;
				let count = $.derived_safe_equal(() => $.fallback(($$arg0?.()).count, 1));
				var p = root_1();
				var text_1 = $.only_child(p);
				$.template_effect(() => $.set_text(text_1, `${title() ?? ""} ${$.get(count) ?? ""}`));
				$.append($$anchor, p);
			};
			empty($$anchor, () => ({ title: "none" }));
		};
		$.if(node, ($$render) => {
			if ($$props.items.length) $$render(consequent);
		});
	}
	var node_1 = $.sibling(node, 2);
	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}
