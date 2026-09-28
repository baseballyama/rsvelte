import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { toast } from "svelte-sonner";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Sonner_with_description($$anchor, $$props) {
	$.push($$props, true);

	Example($$anchor, {
		title: 'With Description',
		class: 'items-center justify-center',
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				onclick: () => toast("Event has been created", { description: "Monday, January 3rd at 6:00pm" }),
				variant: 'outline',
				class: 'w-fit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Show Toast');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}