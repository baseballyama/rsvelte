import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<ul><!></ul> <!> <div><!></div> <button>+</button>`, 1);
export default function Slot_element($$anchor, $$props) {
	$.push($$props, true);
	let count = $.state(0);
	var fragment = root_1();
	var ul = $.first_child(fragment);
	var node = $.child(ul);
	$.slot(node, $$props, "default", {}, null);
	$.reset(ul);
	var node_1 = $.sibling(ul, 2);
	{
		let $0 = $.derived(() => $$props.items.at(0));
		$.slot(node_1, $$props, "header", $.spread_props({
			title: "Hi",
			get count() {
				return $.get(count);
			},
			get total() {
				return $$props.items.length;
			},
			get first() {
				return $.get($0);
			}
		}, () => $$props.rest), ($$anchor) => {
			var p = root();
			var text = $.only_child(p);
			$.template_effect(() => $.set_text(text, `No header ${$.get(count) ?? ""}`));
			$.append($$anchor, p);
		});
	}
	var div = $.sibling(node_1, 2);
	var node_2 = $.child(div);
	$.slot(node_2, $$props, "footer", { get label() {
		return `a ${$.get(count) ?? ""} b`;
	} }, null);
	$.reset(div);
	var button = $.sibling(div, 2);
	$.delegated("click", button, () => $.update(count));
	$.append($$anchor, fragment);
	$.pop();
}
$.delegate(["click"]);
