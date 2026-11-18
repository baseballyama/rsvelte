import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { format } from "./format.js";
const row = ($$anchor, label = $.noop, onclick = $.noop) => {
	var button = root();
	var text = $.only_child(button, true);
	$.template_effect(() => $.set_text(text, label()));
	$.delegated("click", button, function(...$$args) {
		onclick()?.apply(this, $$args);
	});
	$.append($$anchor, button);
};
var root = $.from_html(`<button> </button>`);
var root_1 = $.from_html(`<div><!></div> <!> <!>`, 1);
export default function Render_memo($$anchor, $$props) {
	$.push($$props, true);
	let count = $.state(0);
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);
	{
		let $0 = $.derived(() => format($$props.items));
		row(node, () => $.get($0), () => () => $.update(count));
	}
	$.reset(div);
	var node_1 = $.sibling(div, 2);
	{
		let $0 = $.derived(() => format($.get(count)));
		$.snippet(node_1, () => $$props.header ?? $.noop, () => $.get($0), () => $.get(count));
	}
	var node_2 = $.sibling(node_1, 2);
	row(node_2, () => `${$.get(count)}`, () => format);
	$.append($$anchor, fragment);
	$.pop();
}
$.delegate(["click"]);
