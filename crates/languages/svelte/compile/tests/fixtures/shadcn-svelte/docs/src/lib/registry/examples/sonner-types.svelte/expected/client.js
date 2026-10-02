import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { toast } from "svelte-sonner";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<div class="flex flex-wrap gap-2"><!> <!> <!> <!> <!> <!></div>`);

export default function Sonner_types($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	Button(node, {
		variant: 'outline',
		onclick: () => toast("Event has been created"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		variant: 'outline',
		onclick: () => toast.success("Event has been created"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Success');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		variant: 'outline',
		onclick: () => toast.info("Be at the area 10 minutes before the event time"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Info');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		variant: 'outline',
		onclick: () => toast.warning("Event start time cannot be earlier than 8am"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Warning');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		variant: 'outline',
		onclick: () => toast.error("Event has not been created"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Error');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		variant: 'outline',
		onclick: () => {
			toast.promise(() => new Promise((resolve) => setTimeout(() => resolve({ name: "Event" }), 2000)), {
				loading: "Loading...",
				success: (data) => `${data.name} has been created`,
				error: "Error"
			});
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Promise');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}