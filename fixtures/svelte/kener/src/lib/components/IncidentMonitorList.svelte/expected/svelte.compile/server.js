import * as $ from 'svelte/internal/server';
import { Badge } from "$lib/components/ui/badge/index.js";
import IncidentItem from "$lib/components/IncidentItem.svelte";

export default function IncidentMonitorList($$renderer, $$props) {
	let { incidents, title, class: className = "" } = $$props;

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(incidents);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let incident = each_array[$$index];

		$$renderer.push(`<div class="rounded-3xl border p-3 sm:p-4">`);
		IncidentItem($$renderer, { incident });
		$$renderer.push(`<!----></div>`);
	}

	$$renderer.push(`<!--]-->`);
}