import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import Legacy from "./legacy.svelte";
import LegacyExport from "./legacy-export.svelte";
import TemplateAwait from "./template-await.svelte";
import Events from "./events.svelte";
import Slots from "./slots.svelte";
import OwnRecord from "./own-record.svelte";
import RunesSlotsInterface from "./runes-slots-interface.svelte";
import RunesSlotsRead from "./runes-slots-read.svelte";
import LegacySlotsInterface from "./legacy-slots-interface.svelte";
import EmptyEvents from "./empty-events.svelte";
import DispatchedEvents from "./dispatched-events.svelte";
import ForwardedEvents from "./forwarded-events.svelte";
import StoreNamedState from "./store-named-state.svelte";
var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
export default function Import($$anchor) {
	let legacy = $.state(void 0);
	const types = [
		Legacy,
		LegacyExport,
		TemplateAwait,
		Events,
		Slots,
		RunesSlotsInterface,
		RunesSlotsRead,
		LegacySlotsInterface,
		EmptyEvents,
		DispatchedEvents,
		ForwardedEvents,
		StoreNamedState
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
	var node_5 = $.sibling(node_4, 2);
	OwnRecord(node_5, { foo: "s" });
	var node_6 = $.sibling(node_5, 2);
	RunesSlotsInterface(node_6, { foo: "s" });
	var node_7 = $.sibling(node_6, 2);
	RunesSlotsRead(node_7, { foo: "s" });
	var node_8 = $.sibling(node_7, 2);
	LegacySlotsInterface(node_8, { foo: "s" });
	var node_9 = $.sibling(node_8, 2);
	EmptyEvents(node_9, { foo: "s" });
	var node_10 = $.sibling(node_9, 2);
	DispatchedEvents(node_10, { foo: "s" });
	var node_11 = $.sibling(node_10, 2);
	ForwardedEvents(node_11, { foo: "s" });
	var node_12 = $.sibling(node_11, 2);
	StoreNamedState(node_12, { foo: "s" });
	$.append($$anchor, fragment);
}
