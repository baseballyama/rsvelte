import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p> <section><i> </i></section>`, 1);
var root_1 = $.from_html(`<b> </b>`);
var root_2 = $.from_html(`<button> </button> <!> <!>`, 1);
export default function Declaration_tags($$anchor) {
	let shown = true;
	let start = 3;
	let n = $.state(0), twice = $.derived(() => $.get(n) * 2);
	var fragment = root_2();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var node = $.sibling(button, 2);
	{
		var consequent = ($$anchor) => {
			let box = $.proxy({ v: start });
			const label = "v: ";
			var fragment_1 = root();
			var p = $.first_child(fragment_1);
			var text_1 = $.only_child(p);
			var section = $.sibling(p, 2);
			{
				const label = "inner";
				let t = $.derived(() => $.get(twice) + 1);
				var i = $.child(section);
				var text_2 = $.only_child(i);
				$.reset(section);
				$.template_effect(() => $.set_text(text_2, `inner ${$.get(t) ?? ""}`));
			}
			$.template_effect(() => $.set_text(text_1, `v: ${box.v ?? ""}`));
			$.delegated("click", p, () => box.v++);
			$.append($$anchor, fragment_1);
		};
		$.if(node, ($$render) => {
			if (shown) $$render(consequent);
		});
	}
	var node_1 = $.sibling(node, 2);
	$.each(node_1, 16, () => [1, 2], $.index, ($$anchor, item) => {
		let el = $.state(void 0);
		var b = root_1();
		var text_3 = $.only_child(b, true);
		$.bind_this(b, ($$value) => $.set(el, $$value), () => $.get(el));
		$.template_effect(() => $.set_text(text_3, item));
		$.append($$anchor, b);
	});
	$.template_effect(() => $.set_text(text, `${$.get(n) ?? ""} ${$.get(twice) ?? ""}`));
	$.delegated("click", button, () => $.update(n));
	$.append($$anchor, fragment);
}
$.delegate(["click"]);
