import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import Exports, { answer, double } from "./exports.svelte";
var root = $.from_html(`<!> <p> </p>`, 1);
export default function Import($$anchor, $$props) {
	$.push($$props, true);
	const doubled = double(answer);
	const label = answer;
	var fragment = root();
	var node = $.first_child(fragment);
	Exports(node, {});
	var p = $.sibling(node, 2);
	var text = $.only_child(p);
	$.template_effect(() => $.set_text(text, `${doubled ?? ""} ${label ?? ""}`));
	$.append($$anchor, fragment);
	$.pop();
}
