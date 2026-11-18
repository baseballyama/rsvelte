import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p></p>`);
var root_2 = $.from_html(`<b> </b>`);
var root_3 = $.from_html(`<i> </i>`);
var root_4 = $.from_html(`<span>wait</span>`);
var root_5 = $.from_html(`<!> <!> <!> <div><!></div>`, 1);
export default function Await_block($$anchor, $$props) {
	$.push($$props, true);
	let count = 0;
	var fragment = root_5();
	var node = $.first_child(fragment);
	$.await(node, () => $$props.load(count), ($$anchor) => {
		var p_2 = root_1();
		p_2.textContent = "loading 0";
		$.append($$anchor, p_2);
	}, ($$anchor, value) => {
		var p = root();
		var text = $.only_child(p, true);
		$.template_effect(() => $.set_text(text, $.get(value)));
		$.append($$anchor, p);
	}, ($$anchor, error) => {
		var p_1 = root();
		var text_1 = $.only_child(p_1, true);
		$.template_effect(() => $.set_text(text_1, $.get(error).message));
		$.append($$anchor, p_1);
	});
	var node_1 = $.sibling(node, 2);
	$.await(node_1, () => $$props.other, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var { name, size = 1 } = $.get($$source);
			return {
				name,
				size
			};
		});
		var name = $.derived(() => $.get($$value).name);
		var size = $.derived(() => $.get($$value).size);
		var b = root_2();
		var text_2 = $.only_child(b);
		$.template_effect(() => $.set_text(text_2, `${$.get(name) ?? ""} ${$.get(size) ?? ""}`));
		$.append($$anchor, b);
	});
	var node_2 = $.sibling(node_1, 2);
	$.await(node_2, () => $$props.other, null, void 0, ($$anchor, e) => {
		var i = root_3();
		var text_3 = $.only_child(i, true);
		$.template_effect(() => $.set_text(text_3, $.get(e)));
		$.append($$anchor, i);
	});
	var div = $.sibling(node_2, 2);
	var node_3 = $.child(div);
	$.await(node_3, () => $$props.other, ($$anchor) => {
		var span = root_4();
		$.append($$anchor, span);
	});
	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}
