import * as $ from "svelte/internal/server";
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
export default function Import($$renderer) {
	let legacy = void 0;
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
	Legacy($$renderer, { foo: "s" });
	$$renderer.push(`<!----> `);
	LegacyExport($$renderer, { foo: "s" });
	$$renderer.push(`<!----> `);
	TemplateAwait($$renderer, { foo: "s" });
	$$renderer.push(`<!----> `);
	Events($$renderer, { foo: "s" });
	$$renderer.push(`<!----> `);
	Slots($$renderer, { foo: "s" });
	$$renderer.push(`<!----> `);
	OwnRecord($$renderer, { foo: "s" });
	$$renderer.push(`<!----> `);
	RunesSlotsInterface($$renderer, { foo: "s" });
	$$renderer.push(`<!----> `);
	RunesSlotsRead($$renderer, { foo: "s" });
	$$renderer.push(`<!----> `);
	LegacySlotsInterface($$renderer, { foo: "s" });
	$$renderer.push(`<!----> `);
	EmptyEvents($$renderer, { foo: "s" });
	$$renderer.push(`<!----> `);
	DispatchedEvents($$renderer, { foo: "s" });
	$$renderer.push(`<!----> `);
	ForwardedEvents($$renderer, { foo: "s" });
	$$renderer.push(`<!----> `);
	StoreNamedState($$renderer, { foo: "s" });
	$$renderer.push(`<!---->`);
}
