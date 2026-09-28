import * as $ from 'svelte/internal/server';
import IncidentItem from "$lib/components/IncidentItem.svelte";
import MaintenanceItem from "$lib/components/MaintenanceItem.svelte";
import { t } from "$lib/stores/i18n";
import { setMode } from "mode-watcher";
import { onMount } from "svelte";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		const incidents = $.derived(() => data.incidents ?? []);
		const maintenanceEvents = $.derived(() => data.maintenance_events ?? []);
		const hasEvents = $.derived(() => incidents().length > 0 || maintenanceEvents().length > 0);

		onMount(() => {
			if (data.theme) {
				setMode(data.theme === "dark" ? "dark" : "light");
			}
		});

		$$renderer.push(`<div class="flex flex-col gap-4 p-2">`);

		if (incidents().length > 0) {
			$$renderer.push(`<!--[0--><div class="flex flex-col gap-3"><!--[-->`);

			const each_array = $.ensure_array_like(incidents());

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let incident = each_array[i];

				$$renderer.push(`<div class="rounded-2xl border p-3 sm:p-4">`);
				IncidentItem($$renderer, { incident, showComments: false });
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (maintenanceEvents().length > 0) {
			$$renderer.push(`<!--[0--><div class="flex flex-col gap-3"><!--[-->`);

			const each_array_1 = $.ensure_array_like(maintenanceEvents());

			for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
				let maintenance = each_array_1[i];

				$$renderer.push(`<div class="rounded-2xl border p-3 sm:p-4">`);
				MaintenanceItem($$renderer, { maintenance });
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (!hasEvents()) {
			$$renderer.push(`<!--[0--><section class="rounded-3xl border p-6 text-center"><p class="text-muted-foreground text-sm">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("There are no ongoing incidents or maintenance events."))}</p></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}