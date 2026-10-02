import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { toast } from "svelte-sonner";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Sonner_demo($$anchor, $$props) {
	$.push($$props, true);

	Button($$anchor, {
		variant: 'outline',
		onclick: () => toast("Event has been created", {
			description: "Sunday, December 03, 2023 at 9:00 AM",
			action: { label: "Undo", onClick: () => console.info("Undo") }
		}),

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Show Toast');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.pop();
}