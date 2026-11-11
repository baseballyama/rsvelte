import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import Flaky from "./Flaky.svelte";
var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<i> </i>`);
var root_2 = $.from_html(`<!> <b> </b> <!>`, 1);
var root_3 = $.from_html(`<button></button> <!> <!>`, 1);
export default function Boundary_consts($$anchor) {
	let test = $.state(1);
	let o = $.proxy({
		a: 1,
		b: [2]
	});
	var fragment = root_3();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);
	{
		const failed = ($$anchor) => {
			const double = $.derived(() => $.get(test) * 2);
			const computed_const = $.derived(() => {
				const { a, b: [c] } = o;
				return {
					a,
					c
				};
			});
			var p = root();
			var text = $.only_child(p);
			$.template_effect(() => $.set_text(text, `${$.get(double) ?? ""}${$.get(computed_const).a ?? ""}${$.get(computed_const).c ?? ""}`));
			$.append($$anchor, p);
		};
		const other = ($$anchor) => {
			const double = $.derived(() => $.get(test) * 2);
			const computed_const = $.derived(() => {
				const { a, b: [c] } = o;
				return {
					a,
					c
				};
			});
			var i = root_1();
			var text_1 = $.only_child(i, true);
			$.template_effect(() => $.set_text(text_1, $.get(double)));
			$.append($$anchor, i);
		};
		$.boundary(node, { failed }, ($$anchor) => {
			const double = $.derived(() => $.get(test) * 2);
			const computed_const = $.derived(() => {
				const { a, b: [c] } = o;
				return {
					a,
					c
				};
			});
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);
			Flaky(node_1, {});
			var b = $.sibling(node_1, 2);
			var text_2 = $.only_child(b);
			var node_2 = $.sibling(b, 2);
			other(node_2);
			$.template_effect(() => $.set_text(text_2, `${$.get(double) ?? ""}${$.get(computed_const).a ?? ""}`));
			$.append($$anchor, fragment_1);
		});
	}
	var node_3 = $.sibling(node, 2);
	$.boundary(node_3, {}, ($$anchor) => {
		const x = $.derived(() => $.get(test) + 1);
		var p_1 = root();
		var text_3 = $.only_child(p_1, true);
		$.template_effect(() => $.set_text(text_3, $.get(x)));
		$.append($$anchor, p_1);
	});
	$.delegated("click", button, () => $.update(test));
	$.append($$anchor, fragment);
}
$.delegate(["click"]);
