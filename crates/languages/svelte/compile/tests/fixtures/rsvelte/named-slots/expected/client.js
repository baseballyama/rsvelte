import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import C from "./C.svelte";
var root = $.from_html(`<span slot="0">s</span>`);
var root_1 = $.from_html(`<div slot="a"> </div>`);
var root_2 = $.from_html(`<span> </span>`);
var root_3 = $.from_svg(`<svg><rect></rect></svg>`);
var root_4 = $.from_html(`<!> <!> <!> <button></button>`, 1);
export default function Named_slots($$anchor) {
	let x = $.state(1);
	var fragment = root_4();
	var node = $.first_child(fragment);
	{
		const foo = ($$anchor) => {
			$.next();
			var text = $.text("f");
			$.append($$anchor, text);
		};
		C(node, {
			foo,
			children: ($$anchor, $$slotProps) => {
				$.next();
				var text_1 = $.text();
				$.template_effect(() => $.set_text(text_1, `hello ${$.get(x) ?? ""}`));
				$.append($$anchor, text_1);
			},
			$$slots: {
				foo: true,
				"0": ($$anchor, $$slotProps) => {
					var span = root();
					let classes;
					$.template_effect(() => classes = $.set_class(span, 1, "", null, classes, { x: $.get(x) }));
					$.append($$anchor, span);
				},
				"1": ($$anchor, $$slotProps) => {
					C($$anchor, {
						slot: "1",
						get a() {
							return $.get(x);
						}
					});
				},
				default: true,
				a: ($$anchor, $$slotProps) => {
					var div = root_1();
					var text_2 = $.only_child(div, true);
					$.template_effect(() => $.set_text(text_2, $.get(x)));
					$.append($$anchor, div);
				}
			}
		});
	}
	var node_1 = $.sibling(node, 2);
	C(node_1, { $$slots: {
		b: ($$anchor, $$slotProps) => {
			var span_1 = root_2();
			var text_3 = $.only_child(span_1, true);
			$.template_effect(() => $.set_text(text_3, $.get(x)));
			$.append($$anchor, span_1);
		},
		c: ($$anchor, $$slotProps) => {
			var svg = root_3();
			$.append($$anchor, svg);
		}
	} });
	var node_2 = $.sibling(node_1, 2);
	C(node_2, {
		children: ($$anchor, $$slotProps) => {
			var text_4 = $.text();
			$.template_effect(() => $.set_text(text_4, `plain ${$.get(x) ?? ""}`));
			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});
	var button = $.sibling(node_2, 2);
	$.delegated("click", button, () => $.update(x));
	$.append($$anchor, fragment);
}
$.delegate(["click"]);
