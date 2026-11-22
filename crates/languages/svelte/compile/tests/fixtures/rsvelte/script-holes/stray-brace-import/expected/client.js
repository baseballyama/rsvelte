import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import StrayBrace from "./stray-brace.svelte";
import Legacy from "./stray-brace-legacy.svelte";
import JavaScript from "./stray-brace-javascript.svelte";
import Async from "./stray-brace-async.svelte";
import Slot from "./stray-brace-slot.svelte";
var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
export default function Stray_brace_import($$anchor) {
	let legacy;
	var fragment = root();
	var node = $.first_child(fragment);
	StrayBrace(node, { n: "x" });
	var node_1 = $.sibling(node, 2);
	Legacy(node_1, { n: "x" });
	var node_2 = $.sibling(node_1, 2);
	JavaScript(node_2, { n: "x" });
	var node_3 = $.sibling(node_2, 2);
	Async(node_3, { n: "x" });
	var node_4 = $.sibling(node_3, 2);
	Slot(node_4, { n: "x" });
	var node_5 = $.sibling(node_4, 2);
	$.bind_this(Legacy(node_5, { n: 1 }), ($$value) => legacy = $$value, () => legacy);
	$.append($$anchor, fragment);
}
