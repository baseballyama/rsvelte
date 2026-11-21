import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import Legacy from "./legacy.svelte";
import LegacyExport from "./legacy-export.svelte";
import TemplateAwait from "./template-await.svelte";
import Events from "./events.svelte";
import Slots from "./slots.svelte";
var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
export default function Import($$anchor) {
	let legacy = $.state(void 0);
	const types = [
		Legacy,
		LegacyExport,
		TemplateAwait,
		Events,
		Slots
	];
	var fragment = root();
	var node = $.first_child(fragment);
	$.bind_this(Legacy(node, { foo: "s" }), ($$value) => $.set(legacy, $$value, true), () => $.get(legacy));
	var node_1 = $.sibling(node, 2);
	LegacyExport(node_1, { foo: "s" });
	var node_2 = $.sibling(node_1, 2);
	TemplateAwait(node_2, { foo: "s" });
	var node_3 = $.sibling(node_2, 2);
	Events(node_3, { foo: "s" });
	var node_4 = $.sibling(node_3, 2);
	Slots(node_4, { foo: "s" });
	$.append($$anchor, fragment);
}
