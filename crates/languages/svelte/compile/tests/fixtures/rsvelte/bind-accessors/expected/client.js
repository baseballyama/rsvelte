import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import C from "./C.svelte";
var root = $.from_html(`<i> </i>`);
var root_1 = $.from_html(`<span>x</span> <!>`, 1);
var root_2 = $.from_html(`<p>before</p> <!> <!> <!>`, 1);
export default function Bind_accessors($$anchor) {
	const s = ($$anchor) => {
		var i = root();
		var text = $.only_child(i, true);
		$.template_effect(() => $.set_text(text, $.get(v)));
		$.append($$anchor, i);
	};
	let v = $.state(1);
	let rest = {};
	var fragment = root_2();
	var node = $.sibling($.first_child(fragment), 2);
	var bind_get = () => $.get(v);
	var bind_set = (x) => $.set(v, x, true);
	C(node, $.spread_props({
		a: 1,
		get value() {
			return bind_get();
		},
		set value($$value) {
			bind_set($$value);
		}
	}, () => rest, {
		b: 2,
		get other() {
			return $.get(v);
		},
		set other($$value) {
			$.set(v, $$value, true);
		}
	}));
	var node_1 = $.sibling(node, 2);
	{
		var consequent = ($$anchor) => {
			var fragment_1 = root_1();
			var node_2 = $.sibling($.first_child(fragment_1), 2);
			var bind_get_1 = () => $.get(v);
			var bind_set_1 = (x) => $.set(v, x, true);
			C(node_2, {
				get open() {
					return bind_get_1();
				},
				set open($$value) {
					bind_set_1($$value);
				},
				children: ($$anchor, $$slotProps) => {
					$.next();
					var text_1 = $.text();
					$.template_effect(() => $.set_text(text_1, `child ${$.get(v) ?? ""}`));
					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
			$.append($$anchor, fragment_1);
		};
		$.if(node_1, ($$render) => {
			if ($.get(v)) $$render(consequent);
		});
	}
	var node_3 = $.sibling(node_1, 2);
	s(node_3);
	$.append($$anchor, fragment);
}
