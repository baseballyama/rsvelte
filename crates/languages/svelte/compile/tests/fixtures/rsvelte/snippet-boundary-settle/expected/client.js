import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import Input from "./Input.svelte";
var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p>failed</p>`);
var root_2 = $.from_html(`<p>other</p>`);
var root_3 = $.from_html(`<!> <!>`, 1);
export default function Snippet_boundary_settle($$anchor) {
	const row = ($$anchor) => {
		var p = root();
		var text = $.only_child(p, true);
		$.template_effect(() => $.set_text(text, $.get(value)));
		$.append($$anchor, p);
	};
	let value = $.state("");
	var fragment = root_3();
	var node = $.first_child(fragment);
	Input(node, {
		get value() {
			return $.get(value);
		},
		set value($$value) {
			$.set(value, $$value, true);
		}
	});
	var node_1 = $.sibling(node, 2);
	{
		const failed = ($$anchor) => {
			var p_1 = root_1();
			$.append($$anchor, p_1);
		};
		const other = ($$anchor) => {
			var p_2 = root_2();
			$.append($$anchor, p_2);
		};
		$.boundary(node_1, { failed }, ($$anchor) => {
			var fragment_1 = root_3();
			var node_2 = $.first_child(fragment_1);
			other(node_2);
			var node_3 = $.sibling(node_2, 2);
			row(node_3);
			$.append($$anchor, fragment_1);
		});
	}
	$.append($$anchor, fragment);
}
