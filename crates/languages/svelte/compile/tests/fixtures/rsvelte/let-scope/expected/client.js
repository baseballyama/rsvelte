import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import C from "./C.svelte";
var root = $.from_html(`<p slot="a"> </p>`);
var root_1 = $.from_html(`<!> <button></button>`, 1);
export default function Let_scope($$anchor) {
	let x = $.state(1);
	var fragment = root_1();
	var node = $.first_child(fragment);
	C(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const x = $.derived(() => $$slotProps.x);
				$.next();
				var text = $.text();
				$.template_effect(() => $.set_text(text, $.get(x)));
				$.append($$anchor, text);
			},
			a: ($$anchor, $$slotProps) => {
				var p = root();
				var text_1 = $.only_child(p, true);
				$.template_effect(() => $.set_text(text_1, $.get(x)));
				$.append($$anchor, p);
			},
			b: ($$anchor, $$slotProps) => {
				const y = $.derived(() => $$slotProps.y);
				C($$anchor, {
					slot: "b",
					children: $.invalid_default_snippet,
					$$slots: { default: ($$anchor, $$slotProps) => {
						$.next();
						var text_2 = $.text();
						$.template_effect(() => $.set_text(text_2, `${$.get(x) ?? ""} ${$.get(y) ?? ""}`));
						$.append($$anchor, text_2);
					} }
				});
			}
		}
	});
	var button = $.sibling(node, 2);
	$.delegated("click", button, () => $.update(x));
	$.append($$anchor, fragment);
}
$.delegate(["click"]);
