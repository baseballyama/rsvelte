import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p class="a svelte-49oqy8"> </p> <!>`, 1);
const $$css = {
	hash: "svelte-49oqy8",
	code: ".a.svelte-49oqy8 {color:red;}p.svelte-49oqy8:hover {color:blue}"
};
export default function Css_injected($$anchor, $$props) {
	$.append_styles($$anchor, $$css);
	let x = $.state(1);
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var node = $.sibling(p, 2);
	$.snippet(node, () => $$props.children ?? $.noop);
	$.template_effect(() => $.set_text(text, $.get(x)));
	$.delegated("click", p, () => $.update(x));
	$.append($$anchor, fragment);
}
$.delegate(["click"]);
