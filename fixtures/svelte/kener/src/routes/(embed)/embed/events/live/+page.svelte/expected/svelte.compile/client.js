import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IncidentItem from "$lib/components/IncidentItem.svelte";
import MaintenanceItem from "$lib/components/MaintenanceItem.svelte";
import { t } from "$lib/stores/i18n";
import { setMode } from "mode-watcher";
import { onMount } from "svelte";

var root = $.from_html(`<div class="rounded-2xl border p-3 sm:p-4"><!></div>`);
var root_1 = $.from_html(`<div class="flex flex-col gap-3"></div>`);
var root_2 = $.from_html(`<section class="rounded-3xl border p-6 text-center"><p class="text-muted-foreground text-sm"> </p></section>`);
var root_3 = $.from_html(`<div class="flex flex-col gap-4 p-2"><!> <!> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const incidents = $.derived(() => $$props.data.incidents ?? []);
	const maintenanceEvents = $.derived(() => $$props.data.maintenance_events ?? []);
	const hasEvents = $.derived(() => $.get(incidents).length > 0 || $.get(maintenanceEvents).length > 0);

	onMount(() => {
		if ($$props.data.theme) {
			setMode($$props.data.theme === "dark" ? "dark" : "light");
		}
	});

	var div = root_3();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_1();

			$.each(div_1, 23, () => $.get(incidents), (incident, i) => incident.id ?? i, ($$anchor, incident) => {
				var div_2 = root();
				var node_1 = $.child(div_2);

				IncidentItem(node_1, {
					get incident() {
						return $.get(incident);
					},
					showComments: false
				});

				$.reset(div_2);
				$.append($$anchor, div_2);
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(incidents).length > 0) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_3 = root_1();

			$.each(div_3, 23, () => $.get(maintenanceEvents), (maintenance, i) => maintenance.id ?? i, ($$anchor, maintenance) => {
				var div_4 = root();
				var node_3 = $.child(div_4);

				MaintenanceItem(node_3, {
					get maintenance() {
						return $.get(maintenance);
					}
				});

				$.reset(div_4);
				$.append($$anchor, div_4);
			});

			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node_2, ($$render) => {
			if ($.get(maintenanceEvents).length > 0) $$render(consequent_1);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	{
		var consequent_2 = ($$anchor) => {
			var section = root_2();
			var p = $.child(section);
			var text = $.only_child(p, true);

			$.reset(section);

			$.template_effect(($0) => $.set_text(text, $0), [
				() => $t()("There are no ongoing incidents or maintenance events.")
			]);

			$.append($$anchor, section);
		};

		$.if(node_4, ($$render) => {
			if (!$.get(hasEvents)) $$render(consequent_2);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}