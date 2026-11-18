import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import C from "./C.svelte";
var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<div slot="named"> </div>`);
var root_2 = $.from_html(`<p slot="consts"> </p>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
export default function Let_directives($$anchor) {
	let k = $.state(1);
	var fragment = root_3();
	var node = $.first_child(fragment);
	C(node, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const item = $.derived(() => $$slotProps.item);
				const i = $.derived(() => $$slotProps.index);
				const pair = $.derived(() => {
					let { a, b: [c], ...rest } = $$slotProps.pair;
					return {
						a,
						c,
						rest
					};
				});
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);
				$.each(node_1, 17, () => $.get(item), $.index, ($$anchor, x) => {
					var p = root();
					var text = $.only_child(p);
					$.template_effect(() => $.set_text(text, `${$.get(x) ?? ""} ${$.get(i) ?? ""} ${$.get(pair).a ?? ""} ${$.get(pair).c ?? ""} ${$.get(pair).rest.d ?? ""} ${$.get(k) ?? ""}`));
					$.delegated("click", p, () => $.update(k));
					$.append($$anchor, p);
				});
				$.append($$anchor, fragment_1);
			},
			named: ($$anchor, $$slotProps) => {
				const x = $.derived(() => $$slotProps.x);
				var div = root_1();
				var text_1 = $.only_child(div, true);
				$.template_effect(() => $.set_text(text_1, $.get(x)));
				$.append($$anchor, div);
			},
			f: ($$anchor, $$slotProps) => {
				const y = $.derived(() => {
					let { z } = $$slotProps.y;
					return { z };
				});
				var text_2 = $.text();
				$.template_effect(() => $.set_text(text_2, $.get(y).z));
				$.append($$anchor, text_2);
			},
			comp: ($$anchor, $$slotProps) => {
				const w = $.derived(() => $$slotProps.w);
				C($$anchor, {
					slot: "comp",
					get foo() {
						return $.get(w);
					},
					children: $.invalid_default_snippet,
					$$slots: { default: ($$anchor, $$slotProps) => {
						$.next();
						var text_3 = $.text();
						$.template_effect(() => $.set_text(text_3, $.get(w)));
						$.append($$anchor, text_3);
					} }
				});
			},
			consts: ($$anchor, $$slotProps) => {
				const v = $.derived(() => $$slotProps.v);
				const twice = $.derived(() => $.get(v) * 2);
				var p_1 = root_2();
				var text_4 = $.only_child(p_1, true);
				$.template_effect(() => $.set_text(text_4, $.get(twice)));
				$.append($$anchor, p_1);
			}
		}
	});
	var node_2 = $.sibling(node, 2);
	C(node_2, {
		children: $.invalid_default_snippet,
		$$slots: { default: ($$anchor, $$slotProps) => {
			const v = $.derived(() => $$slotProps.v);
			var text_5 = $.text();
			$.template_effect(() => $.set_text(text_5, $.get(v)));
			$.append($$anchor, text_5);
		} }
	});
	var node_3 = $.sibling(node_2, 2);
	C(node_3, {
		children: $.invalid_default_snippet,
		$$slots: { default: ($$anchor, $$slotProps) => {
			const u = $.derived(() => $$slotProps.u);
			var text_6 = $.text();
			$.template_effect(() => $.set_text(text_6, $.get(u)));
			$.append($$anchor, text_6);
		} }
	});
	$.append($$anchor, fragment);
}
$.delegate(["click"]);
