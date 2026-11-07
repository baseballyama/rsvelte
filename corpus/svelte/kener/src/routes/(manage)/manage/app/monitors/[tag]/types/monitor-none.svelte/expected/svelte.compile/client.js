import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "$lib/components/ui/checkbox/index.js";
import { Label } from "$lib/components/ui/label/index.js";

var root = $.from_html(`<div class="space-y-4"><div class="bg-muted/50 rounded-lg p-6 text-center"><p class="text-muted-foreground text-sm">This monitor type does not have any automatic checks. Status updates must be made manually via the API or through
      incidents.</p></div> <div class="flex items-start gap-3 rounded-lg border p-4"><!> <div class="grid gap-1.5 leading-none"><!> <p class="text-muted-foreground text-sm">On each scheduled run, reuse the last manual status (created using the API) so this monitor keeps that state in
        status history, uptime, and alert evaluation until you change it.</p></div></div></div>`);

export default function Monitor_none($$anchor, $$props) {
	$.push($$props, true);

	let data = $.prop($$props, 'data', 15);

	if (data().overrideWithLastKnownStatus === undefined) {
		data(data().overrideWithLastKnownStatus = false, true);
	}

	var div = root();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	Checkbox(node, {
		id: 'none-override-last-known-status',
		get checked() {
			return data().overrideWithLastKnownStatus;
		},

		set checked($$value) {
			data(data().overrideWithLastKnownStatus = $$value, true);
		}
	});

	var div_2 = $.sibling(node, 2);
	var node_1 = $.child(div_2);

	Label(node_1, {
		for: 'none-override-last-known-status',
		class: 'cursor-pointer',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Override with last known status');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}