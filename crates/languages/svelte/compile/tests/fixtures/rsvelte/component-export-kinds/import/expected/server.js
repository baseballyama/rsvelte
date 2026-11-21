import * as $ from "svelte/internal/server";
import Legacy from "./legacy.svelte";
import LegacyExport from "./legacy-export.svelte";
import TemplateAwait from "./template-await.svelte";
import Events from "./events.svelte";
import Slots from "./slots.svelte";
import OwnRecord from "./own-record.svelte";
export default function Import($$renderer) {
	let legacy = void 0;
	const types = [
		Legacy,
		LegacyExport,
		TemplateAwait,
		Events,
		Slots
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
	$$renderer.push(`<!---->`);
}
