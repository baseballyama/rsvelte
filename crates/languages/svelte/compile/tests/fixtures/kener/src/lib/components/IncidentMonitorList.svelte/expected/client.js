import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge } from "$lib/components/ui/badge/index.js";
import IncidentItem from "$lib/components/IncidentItem.svelte";

var root = $.from_html(`<div class=" rounded-3xl border p-3 sm:p-4"><!></div>`);

export default function IncidentMonitorList($$anchor, $$props) {
	let className = $.prop($$props, 'class', 3, "");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => $$props.incidents, (incident) => incident.id, ($$anchor, incident) => {
		var div = root();
		var node_1 = $.child(div);

		IncidentItem(node_1, {
			get incident() {
				return $.get(incident);
			}
		});

		$.reset(div);
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
}