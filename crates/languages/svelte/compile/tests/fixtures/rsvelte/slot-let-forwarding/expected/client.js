import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import C from "./C.svelte";
var root = $.from_html(`<div slot="a"><!></div>`);
export default function Slot_let_forwarding($$anchor, $$props) {
	C($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);
			const foo = $.derived(() => $$slotProps.foo);
			$.slot(node, $$props, "default", { get foo() {
				return $.get(foo);
			} }, ($$anchor) => {
				var text = $.text();
				$.template_effect(() => $.set_text(text, $.get(foo)));
				$.append($$anchor, text);
			});
			$.append($$anchor, fragment_1);
		},
		$$slots: {
			default: true,
			a: ($$anchor, $$slotProps) => {
				var div = root();
				var node_1 = $.child(div);
				const bar = $.derived(() => {
					let { baz } = $$slotProps.bar;
					return { baz };
				});
				$.slot(node_1, $$props, "b", { get baz() {
					return $.get(bar).baz;
				} }, null);
				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});
}
